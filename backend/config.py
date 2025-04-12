import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv('MONGO_URI')
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
    # MAX_CONTENT_LENGTH = 10 * 1024 * 1024,  # 10MB max upload size
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB
    GENERATED_IMAGES_FOLDER = 'generated_images'
    UPLOAD_FOLDER = 'uploads'