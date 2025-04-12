from flask import Blueprint, request, jsonify
from utils.image_generator import ImageGenerator
from models.image import Image
from config import Config
import jwt
import os
from werkzeug.utils import secure_filename

image_bp = Blueprint('image', __name__)

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

@image_bp.route('/generate', methods=['POST'])
@token_required
def generate_image():
    data = request.get_json()
    prompt = data.get('prompt')
    size = data.get('size', '1024x1024')
    style = data.get('style', 'realistic')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    try:
        image_data = ImageGenerator.generate_image(prompt, size, style)
        return jsonify({'image': image_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@image_bp.route('/upload', methods=['POST'])
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

@image_bp.route('/save', methods=['POST'])
@token_required
def save_image():
    data = request.get_json()
    title = data.get('title')
    category = data.get('category')
    url = data.get('url')

    if not all([title, category, url]):
        return jsonify({'error': 'Missing required fields'}), 400

    image_id = Image.create(request.user_id, title, category, url)
    return jsonify({'image_id': str(image_id)}), 201