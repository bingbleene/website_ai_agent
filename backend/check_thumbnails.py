from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv('MONGODB_URI'))
db = client[os.getenv('MONGODB_DB_NAME')]

articles = list(db.articles.find({}, {'_id': 1, 'title': 1, 'thumbnail': 1}).limit(10))

for a in articles:
    print(f"ID: {a['_id']}")
    print(f"Title: {a['title'][:60]}...")
    print(f"Thumbnail: {a.get('thumbnail', 'N/A')}")
    print("-" * 80)

client.close()
