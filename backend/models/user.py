from pymongo import MongoClient
from config import Config
import bcrypt

class User:
    collection = MongoClient(Config.MONGO_URI).imagetales.users

    @classmethod
    def create(cls, email, username, password):
        from bson.objectid import ObjectId
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        result = cls.collection.insert_one({
            'email': email,
            'username': username,
            'password': hashed_password,
            'credits': 0,
            'plan': 'Free'
        })
        return result.inserted_id

    @classmethod
    def find_by_email(cls, email):
        return cls.collection.find_one({'email': email})

    @classmethod
    def find_by_id(cls, user_id):
        from bson.objectid import ObjectId
        return cls.collection.find_one({'_id': ObjectId(user_id)})