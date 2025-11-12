"""
Script to clear all articles from MongoDB
Run: python clear_all_articles.py
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "ai_news_db")

def clear_articles():
    """Clear all articles from MongoDB"""
    print(f"🔌 Connecting to MongoDB: {MONGODB_DB_NAME}...")
    
    client = MongoClient(MONGODB_URI)
    db = client[MONGODB_DB_NAME]
    
    # Count before
    count = db.articles.count_documents({})
    print(f"📊 Found {count} articles")
    
    if count == 0:
        print("⚠️ No articles to delete")
        client.close()
        return
    
    # Delete
    print("🗑️ Deleting all articles...")
    result = db.articles.delete_many({})
    
    print(f"✅ Deleted {result.deleted_count} articles")
    
    client.close()

if __name__ == "__main__":
    clear_articles()
