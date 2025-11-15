import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env from backend folder
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)

uri = os.getenv('MONGODB_URI')
db_name = os.getenv('MONGODB_DB_NAME', 'ai_news_db')

print(f"Using MONGODB_URI={uri}")
print(f"Using MONGODB_DB_NAME={db_name}")

if not uri:
    print("[ERROR] MONGODB_URI is not set in .env")
    raise SystemExit(1)

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    # The ping command is cheap and does not require auth for some configs, but here we call admin.command
    client.admin.command('ping')
    db = client[db_name]
    print("✅ Connected to MongoDB server")
    print("Collections:", db.list_collection_names())
    client.close()
except Exception as e:
    print("❌ Cannot connect to MongoDB:", e)
    raise SystemExit(2)
