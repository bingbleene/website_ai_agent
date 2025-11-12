from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
client = MongoClient(os.getenv('MONGODB_URI'))
db = client.ai_news_db
print("\nID | created_at | published_at | updated_at")
print("="*80)
for a in db.articles.find({'status': 'published'}).limit(10):
    print(f"{a['_id']} | {a.get('created_at')} | {a.get('published_at')} | {a.get('updated_at')}")
client.close()
