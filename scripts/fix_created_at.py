# run this in case created_at is missing from any image in images collection
import sys
import os
from datetime import datetime, timezone
from pymongo import MongoClient

# Add path to backend folder
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from config import Config

client = MongoClient(Config.MONGO_URI)
images = client.imagetales.images

result = images.update_many(
    { 'created_at': { '$exists': False } },
    { '$set': { 'created_at': datetime.now(timezone.utc) } }
)

print(f"✅ Updated {result.modified_count} documents with missing created_at")
