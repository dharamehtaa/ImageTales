from pymongo import MongoClient
from config import Config
from datetime import datetime
from bson.objectid import ObjectId
from datetime import datetime, timezone

class Image:
    collection = MongoClient(Config.MONGO_URI).imagetales.images

    @classmethod
    def create(cls, user_id, title, category, url, prompt, is_generated=True, created_at=None):
        """
        Create a new image record
        Args:
            user_id: ID of the user who created the image
            title: Title of the image
            category: Category of the image
            url: URL/path to the image
            prompt: The prompt used to generate the image
            is_generated: Whether the image was AI-generated (default) or uploaded
        Returns:
            The inserted image ID
        """
        image_data = {
        'user_id': ObjectId(user_id),
        'title': title,
        'category': category,
        'url': url,
        'prompt': prompt,
        'likes': 0,
        'created_at': created_at or datetime.now(timezone.utc),
        'is_generated': is_generated,
        'views': 0
        }
        result = cls.collection.insert_one(image_data)
        return result.inserted_id

    @classmethod
    def get_all(cls, limit=100, sort_by='created_at', sort_order=-1):
        """
        Get all images with pagination and sorting
        Args:
            limit: Maximum number of images to return
            sort_by: Field to sort by
            sort_order: 1 for ascending, -1 for descending
        Returns:
            List of image documents
        """
        return list(cls.collection.find()
                   .sort(sort_by, sort_order)
                   .limit(limit))

    @classmethod
    def find_by_user(cls, user_id, limit=50):
        """
        Find all images for a specific user
        Args:
            user_id: The user's ID
            limit: Maximum number of images to return
        Returns:
            List of the user's image documents
        """
        return list(cls.collection.find({'user_id': ObjectId(user_id)})
                   .sort('created_at', -1)
                   .limit(limit))

    @classmethod
    def find_by_id(cls, image_id):
        """
        Find a single image by its ID
        Args:
            image_id: The image's ID
        Returns:
            The image document or None if not found
        """
        return cls.collection.find_one({'_id': ObjectId(image_id)})

    @classmethod
    def find_by_url(cls, url):
        """
        Find an image by its URL
        Args:
            url: The image URL/path
        Returns:
            The image document or None if not found
        """
        return cls.collection.find_one({'url': url})

    @classmethod
    def increment_views(cls, image_id):
        """
        Increment the view count for an image
        Args:
            image_id: The image's ID
        Returns:
            The updated view count
        """
        result = cls.collection.update_one(
            {'_id': ObjectId(image_id)},
            {'$inc': {'views': 1}}
        )
        return result.modified_count

    @classmethod
    def toggle_like(cls, image_id, user_id):
        """
        Toggle a like on an image by a user
        Args:
            image_id: The image's ID
            user_id: The user's ID
        Returns:
            The new like status and count
        """
        image = cls.find_by_id(image_id)
        if not image:
            return None

        likes = image.get('likes', 0)
        liked_by = image.get('liked_by', [])

        if ObjectId(user_id) in liked_by:
            # Unlike
            new_likes = likes - 1
            new_liked_by = [uid for uid in liked_by if uid != ObjectId(user_id)]
        else:
            # Like
            new_likes = likes + 1
            new_liked_by = liked_by + [ObjectId(user_id)]

        cls.collection.update_one(
            {'_id': ObjectId(image_id)},
            {'$set': {
                'likes': new_likes,
                'liked_by': new_liked_by
            }}
        )

        return {
            'liked': ObjectId(user_id) in new_liked_by,
            'likes': new_likes
        }

    @classmethod
    def delete_image(cls, image_id, user_id):
        """
        Delete an image if the user is the owner
        Args:
            image_id: The image's ID
            user_id: The user's ID
        Returns:
            True if deleted, False otherwise
        """
        result = cls.collection.delete_one({
            '_id': ObjectId(image_id),
            'user_id': ObjectId(user_id)
        })
        return result.deleted_count > 0