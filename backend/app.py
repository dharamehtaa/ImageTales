from flask import Flask, Blueprint, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
import os
from werkzeug.utils import secure_filename
import bcrypt
from config import Config
from models.user import User
from models.image import Image
from utils.image_generator import ImageGenerator
from datetime import datetime, timezone

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

if not os.path.exists(Config.UPLOAD_FOLDER):
    os.makedirs(Config.UPLOAD_FOLDER)

@app.route('/generated/<path:filename>')
def serve_generated_image(filename):
    return send_from_directory(os.getcwd(), filename)
        # return send_from_directory(Config.GENERATED_IMAGES_FOLDER, filename)


auth_bp = Blueprint('auth', __name__)

def token_required(f):
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            data = jwt.decode(token.split()[1], Config.SECRET_KEY, algorithms=["HS256"])
            request.user_id = data['user_id']
        except:
            return jsonify({'error': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'], endpoint='register')
def register():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    if not all([email, username, password]):
        return jsonify({'error': 'Email, username, and password are required'}), 400
    if User.find_by_email(email):
        return jsonify({'error': 'User already exists'}), 400
    user_id = User.create(email, username, password)
    token = jwt.encode({
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, Config.SECRET_KEY)
    return jsonify({'token': token}), 201

@auth_bp.route('/login', methods=['POST'], endpoint='login')
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not all([email, password]):
        return jsonify({'error': 'Email and password are required'}), 400
    user = User.find_by_email(email)
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    token = jwt.encode({
        'user_id': str(user['_id']),
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, Config.SECRET_KEY)
    return jsonify({'token': token}), 200

@auth_bp.route('/profile', methods=['GET'], endpoint='profile')
@token_required
def profile():
    user = User.find_by_id(request.user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        '_id': str(user['_id']),
        'email': user['email'],
        'username': user['username'],
        'credits': user.get('credits', 0),
        'plan': user.get('plan', 'Free')
    }), 200

image_bp = Blueprint('image', __name__)

@image_bp.route('/generate', methods=['POST'], endpoint='generate_image')
@token_required
def generate_image():
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400
    try:
        image_path, generated_prompt = ImageGenerator.generate_image(prompt)
        if not image_path:
            return jsonify({'error': 'Image generation failed'}), 500
        
         # 2. Extract just the filename from the path
        filename = os.path.basename(image_path)
        
         # Auto-save the generated image
        title = f"Generated: {prompt[:50]}"  # Truncate if too long
        image_id = Image.create(
            user_id=request.user_id,
            title=title,
            category="generated",
            url=f"/generated/{filename}",
            prompt=generated_prompt,
            #  created_at=datetime.now(datetime.timezone.utc),  # Add timestamp
            created_at = datetime.now(timezone.utc),
            is_generated=True
        )

        # image_url = f"/generated/{image_path}"
        # return jsonify({'image': image_url, 'prompt': generated_prompt}), 200

        # 4. Return the URL that matches your serving route
        return jsonify({
            'image': f"/generated/{filename}",
            'prompt': generated_prompt,
            'image_id': str(image_id)  # Useful for client-side reference
        }), 200
    
    except Exception as e:
        app.logger.error(f"Image generation failed: {str(e)}")
        return jsonify({'error': str(e)}), 500

@image_bp.route('/modify', methods=['POST'], endpoint='modify_image')
@token_required
def modify_image():
    data = request.get_json()
    original_prompt = data.get('original_prompt')  # Get from request body
    modification_prompt = data.get('modification_prompt')
    
    if not all([original_prompt, modification_prompt]):
        return jsonify({'error': 'Original prompt and modification prompt are required'}), 400

    try:
        # Combine prompts locally
        combined_prompt = f"{original_prompt} {modification_prompt}"
        
        # Generate new image based on combined prompts
        modified_path, modified_prompt = ImageGenerator.modify_image(
            original_prompt=original_prompt,
            modification_prompt=modification_prompt
        )
        
        if not modified_path:
            return jsonify({'error': 'Image modification failed'}), 500
            
        modified_url = f"/generated/{modified_path}"
        return jsonify({
            'image': modified_url,
            'prompt': modified_prompt
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Image modification failed: {str(e)}'}), 500
    


      
@image_bp.route('/upload', methods=['POST'], endpoint='upload_image')
@token_required
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    filename = secure_filename(file.filename)
    filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(filepath)
    return jsonify({'url': f"/uploads/{filename}"}), 200

@image_bp.route('/save', methods=['POST'], endpoint='save_image')
@token_required
def save_image():
    data = request.get_json()
    title = data.get('title')
    category = data.get('category')
    url = data.get('url')
    prompt = data.get('prompt')
    
    if not all([title, category, url, prompt]):
        return jsonify({'error': 'Missing required fields (title, category, url, prompt)'}), 400
    
    image_id = Image.create(request.user_id, title, category, url, prompt)
    return jsonify({
        'image_id': str(image_id),
        'message': 'Image saved successfully'
    }), 201


@image_bp.route('/story', methods=['POST'], endpoint='generate_story')
@token_required
def generate_story():
    data = request.get_json()
    story_prompt = data.get('story_prompt')
    num_images = data.get('num_images', 3)
    if not story_prompt or not isinstance(num_images, int) or num_images < 1 or num_images > 10:
        return jsonify({'error': 'Story prompt and valid number of images (1-10) are required'}), 400
    
    try:
        story_result = ImageGenerator.generate_story(story_prompt, num_images)
        if not story_result or any(scene['path'] is None for scene in story_result['scenes']):
            return jsonify({'error': 'Story generation failed'}), 500
        
        formatted_scenes = [
            {
                'text': scene['text'],
                'image': f"/generated/{scene['path']}",
                'prompt': scene['prompt'],
                'timestamp': datetime.now().strftime('%B %d, %Y - %I:%M%p')
            }
            for scene in story_result['scenes']
        ]
        return jsonify({
            'introduction': story_result['introduction'],
            'scenes': formatted_scenes
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

gallery_bp = Blueprint('gallery', __name__)

@gallery_bp.route('/all', methods=['GET'], endpoint='get_all_images')
def get_all_images():
    images = Image.get_all()
    return jsonify([{
        'id': str(img['_id']),
        'title': img['title'],
        'category': img['category'],
        'url': img['url'],
        'likes': img['likes'],
        'prompt': img.get('prompt', '')
    } for img in images]), 200

@gallery_bp.route('/user', methods=['GET'], endpoint='get_user_images')
@token_required
def get_user_images():
    images = Image.find_by_user(request.user_id)
    return jsonify([{
        'id': str(img['_id']),
        'title': img['title'],
        'category': img['category'],
        'url': img['url'],
        'likes': img['likes'],
        'prompt': img.get('prompt', '')
    } for img in images]), 200

@gallery_bp.route('/like/<image_id>', methods=['POST'], endpoint='like_image')
@token_required
def like_image(image_id):
    image = Image.find_by_id(image_id)
    if not image:
        return jsonify({'error': 'Image not found'}), 404
    Image.collection.update_one(
        {'_id': image['_id']},
        {'$set': {'likes': image['likes'] + 1 if image['likes'] == 0 else image['likes'] - 1}}
    )
    return jsonify({'message': 'Like toggled'}), 200

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    image = request.files['image']
    if image.filename == '':
        return jsonify({'error': 'Invalid file name'}), 400

    filename = secure_filename(image.filename)
    file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    image.save(file_path)

    # Analyze the image
    analysis_result = ImageGenerator.analyze_image(file_path)

    return jsonify(analysis_result), 200


app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(image_bp, url_prefix='/image')
app.register_blueprint(gallery_bp, url_prefix='/gallery')

@app.route('/')
def health_check():
    return 'ImageTales Backend is running', 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)