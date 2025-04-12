from flask import Blueprint, jsonify
from models.image import Image
from routes.image import token_required

gallery_bp = Blueprint('gallery', __name__)

@gallery_bp.route('/all', methods=['GET'])
def get_all_images():
    images = Image.get_all()
    return jsonify([{
        'id': str(img['_id']),
        'title': img['title'],
        'category': img['category'],
        'url': img['url'],
        'likes': img['likes']
    } for img in images]), 200

@gallery_bp.route('/user', methods=['GET'])
@token_required
def get_user_images():
    images = Image.find_by_user(request.user_id)
    # return jsonify([{
    #     'id': str(img['_id']),
    #     'title': img['title'],
    #     'category': img['category'],
    #     'url': img['url'],
    #     'likes': img['likes'],
    #     'prompt': img.get('prompt', ''),
    #     # 'created_at': img['created_at'].isoformat(),
    #     'created_at': img.get('created_at').isoformat() if img.get('created_at') else '',
    #     'is_generated': img.get('is_generated', False)
    # } for img in images]), 200

    def format_datetime(dt):
        if isinstance(dt, datetime):
            return dt.isoformat()
        return str(dt) if dt else ""

    return jsonify([{
        'id': str(img['_id']),
        'title': img['title'],
        'category': img['category'],
        'url': img['url'],
        'likes': img['likes'],
        'prompt': img.get('prompt', ''),
        'is_generated': img.get('is_generated', False),
        'created_at': format_datetime(img.get('created_at'))
    } for img in images]), 200

@gallery_bp.route('/like/<image_id>', methods=['POST'])
@token_required
def like_image(image_id):
    image = Image.find_by_id(image_id)
    if not image:
        return jsonify({'error': 'Image not found'}), 404
    
    # Simple like toggle (in production, you'd track per-user likes)
    Image.collection.update_one(
        {'_id': image['_id']},
        {'$set': {'likes': image['likes'] + 1 if image['likes'] == 0 else image['likes'] - 1}}
    )
    return jsonify({'message': 'Like toggled'}), 200
