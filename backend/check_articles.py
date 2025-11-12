from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGODB_URI'))
db = client.ai_news_db

print(f"\n📊 Total published articles: {db.articles.count_documents({'status': 'published'})}")
print("\n📋 Published articles:")
print("=" * 80)

articles = list(db.articles.find({'status': 'published'}).limit(10))
for a in articles:
    print(f"ID: {a['_id']} | Title: {a['title'][:60]}")
    print(f"   Status: {a.get('status')} | Category: {a.get('category')}")
    print(f"   Thumbnail: {a.get('thumbnail', 'N/A')[:80]}")
    print("-" * 80)

client.close()
