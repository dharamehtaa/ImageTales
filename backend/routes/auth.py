from flask import Blueprint, request, jsonify
from models.user import User
import jwt
from config import Config
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')

    if User.find_by_email(email):
        return jsonify({'error': 'User already exists'}), 400

    user_id = User.create(email, username)
    token = jwt.encode({
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, Config.SECRET_KEY)

    return jsonify({'token': token}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    
    user = User.find_by_email(email)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    token = jwt.encode({
        'user_id': str(user['_id']),
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, Config.SECRET_KEY)

    return jsonify({'token': token}), 200

