# 🚀 Hướng dẫn Cài đặt & Chạy Local

> Hướng dẫn chi tiết từng bước để chạy dự án trên máy tính local (không dùng Docker)

## 📋 Mục lục
1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt phần mềm cần thiết](#cài-đặt-phần-mềm-cần-thiết)
3. [Thiết lập MongoDB Atlas](#thiết-lập-mongodb-atlas)
4. [Thiết lập RabbitMQ](#thiết-lập-rabbitmq)
5. [Cấu hình API Keys](#cấu-hình-api-keys)
6. [Cài đặt Backend](#cài-đặt-backend)
7. [Cài đặt Frontend](#cài-đặt-frontend)
8. [Chạy ứng dụng](#chạy-ứng-dụng)
9. [Kiểm tra](#kiểm-tra)
10. [Troubleshooting](#troubleshooting)

---

## 1. Yêu cầu hệ thống

### Phần cứng tối thiểu:
- RAM: 8GB (khuyến nghị 16GB)
- Ổ cứng: 5GB trống
- CPU: Dual-core trở lên

### Hệ điều hành:
- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 20.04+)

---

## 2. Cài đặt phần mềm cần thiết

### A. Python 3.10+

**Windows:**
```powershell
# Tải Python từ python.org
# Hoặc dùng chocolatey:
choco install python --version=3.10

# Kiểm tra
python --version
```

**macOS:**
```bash
# Dùng Homebrew
brew install python@3.10

# Kiểm tra
python3 --version
```

**Linux:**
```bash
sudo apt update
sudo apt install python3.10 python3.10-venv python3-pip

# Kiểm tra
python3 --version
```

### B. Node.js 18+

**Windows:**
```powershell
# Tải từ nodejs.org
# Hoặc dùng chocolatey:
choco install nodejs-lts

# Kiểm tra
node --version
npm --version
```

**macOS:**
```bash
brew install node@18

# Kiểm tra
node --version
npm --version
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra
node --version
npm --version
```

### C. Git

**Windows:**
```powershell
choco install git
```

**macOS:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt install git
```

---

## 3. Thiết lập MongoDB Atlas

### Bước 1: Tạo tài khoản MongoDB Atlas

1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Đăng ký account miễn phí
3. Xác nhận email

### Bước 2: Tạo Cluster

1. Click **"Build a Database"**
2. Chọn **"FREE"** (M0 Sandbox)
3. Chọn Provider: **AWS** (hoặc Google Cloud / Azure)
4. Chọn Region gần nhất (ví dụ: **Singapore** cho VN)
5. Cluster Name: `ai-news-cluster`
6. Click **"Create Cluster"** (Đợi 3-5 phút)

### Bước 3: Tạo Database User

1. Vào **Security** → **Database Access**
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `admin`
5. Password: `Admin123456` (hoặc tự chọn - **GHI NHỚ MẬT KHẨU NÀY**)
6. Database User Privileges: **Atlas admin**
7. Click **"Add User"**

### Bước 4: Whitelist IP Address

1. Vào **Security** → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ **Chỉ dùng cho development, không production!**
4. Click **"Confirm"**

### Bước 5: Lấy Connection String

1. Vào **Deployment** → **Database**
2. Click **"Connect"** trên cluster của bạn
3. Chọn **"Connect your application"**
4. Driver: **Python** / Version: **3.12 or later**
5. Copy connection string, dạng:
   ```
   mongodb+srv://admin:<password>@ai-news-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Thay `<password>` bằng mật khẩu thực của bạn** (bước 3)
7. **GHI NHỚ CONNECTION STRING NÀY**

### Bước 6: Tạo Vector Search Index

1. Vào **Deployment** → **Database**
2. Click vào cluster → Tab **"Search"**
3. Click **"Create Search Index"**
4. Chọn **"JSON Editor"**
5. Database: `ai_news_db`
6. Collection: `articles`
7. Index Name: `article_vector_index`
8. Paste JSON sau:

```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "article_vector": {
        "type": "knnVector",
        "dimensions": 3072,
        "similarity": "cosine"
      }
    }
  }
}
```

9. Click **"Create Search Index"**

---

## 4. Thiết lập RabbitMQ

### Tùy chọn 1: Docker (Khuyến nghị - Đơn giản nhất)

**Cài Docker Desktop:**
- Windows/Mac: https://www.docker.com/products/docker-desktop
- Linux: `sudo apt install docker.io`

**Chạy RabbitMQ:**
```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

**Kiểm tra:**
- Truy cập: http://localhost:15672
- Username: `guest`
- Password: `guest`

### Tùy chọn 2: Cài trực tiếp

**Windows:**
```powershell
# Cài Erlang trước
choco install erlang

# Cài RabbitMQ
choco install rabbitmq

# Khởi động service
rabbitmq-service start

# Enable management plugin
rabbitmq-plugins enable rabbitmq_management
```

**macOS:**
```bash
brew install rabbitmq

# Khởi động
brew services start rabbitmq

# Enable management
rabbitmq-plugins enable rabbitmq_management
```

**Linux:**
```bash
# Thêm repository
sudo apt-get install curl gnupg apt-transport-https -y
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null

# Cài đặt
sudo apt-get update
sudo apt-get install rabbitmq-server -y

# Khởi động
sudo systemctl start rabbitmq-server
sudo systemctl enable rabbitmq-server

# Enable management
sudo rabbitmq-plugins enable rabbitmq_management
```

---

## 5. Cấu hình API Keys

### A. OpenAI API Key

1. Truy cập: https://platform.openai.com/
2. Đăng nhập / Đăng ký
3. Vào **API keys**: https://platform.openai.com/api-keys
4. Click **"Create new secret key"**
5. Name: `ai-news-system`
6. Copy key (bắt đầu với `sk-...`)
7. **GHI NHỚ KEY NÀY** (chỉ hiện 1 lần)

💰 **Chi phí**: 
- Tài khoản mới: $5 credit miễn phí
- Sau đó: Pay-as-you-go (~$0.01-0.03 per request)

### B. Google Gemini API Key (Alternative cho OpenAI)

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập với Google account
3. Click **"Create API Key"**
4. Copy key
5. **GHI NHỚ KEY NÀY**

💰 **Chi phí**: Miễn phí (có quota limits)

### C. Google Cloud APIs (Optional - cho Translation & Sentiment)

**Bỏ qua bước này nếu chỉ muốn test cơ bản**

1. Truy cập: https://console.cloud.google.com/
2. Tạo project mới: `ai-news-system`
3. Enable APIs:
   - Cloud Translation API
   - Cloud Natural Language API
4. Tạo Service Account:
   - IAM & Admin → Service Accounts → Create
   - Role: `Editor`
   - Create Key → JSON
5. Download file JSON
6. **GHI NHỚ VỊ TRÍ FILE JSON**

### D. AWS (Optional - cho Personalize & SES)

**Bỏ qua bước này nếu chỉ muốn test cơ bản**

1. Truy cập: https://aws.amazon.com/
2. Tạo account (cần credit card, nhưng có free tier)
3. IAM → Users → Create User
4. Attach policies: `AmazonPersonalizeFullAccess`, `AmazonSESFullAccess`
5. Create Access Key
6. **GHI NHỚ Access Key ID và Secret Key**

---

## 6. Cài đặt Backend

### Bước 1: Clone repository

```bash
cd d:\DownloadLT\UIT\jib\admin_website
```

(Bạn đã có folder này rồi)

### Bước 2: Tạo Virtual Environment

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Sau khi activate, terminal sẽ có `(venv)` ở đầu.

### Bước 3: Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Thời gian**: 2-5 phút

### Bước 4: Tạo file .env

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

### Bước 5: Cấu hình .env

Mở file `backend/.env` bằng editor (VSCode, Notepad++, v.v.) và điền:

```env
# Application
APP_NAME="AI News Management System"
DEBUG=True
SECRET_KEY=your-super-secret-key-change-this-in-production-123456
JWT_SECRET_KEY=jwt-secret-key-change-this-too-987654

# MongoDB Atlas (QUAN TRỌNG - Điền connection string từ bước 3.5)
MONGODB_URI=mongodb+srv://admin:Admin123456@ai-news-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=ai_news_db

# OpenAI (QUAN TRỌNG - Điền API key từ bước 5.A)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# Google Gemini (Alternative)
GEMINI_API_KEY=your-gemini-key-if-you-have-it

# RabbitMQ (Mặc định nếu chạy local)
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# Google Cloud (Optional - Bỏ trống nếu không có)
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=
GOOGLE_TRANSLATE_API_KEY=

# AWS (Optional - Bỏ trống nếu không có)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_PERSONALIZE_CAMPAIGN_ARN=
AWS_SES_SENDER_EMAIL=

# CORS (Frontend URL)
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

**Lưu ý quan trọng**:
- Các dòng có `QUAN TRỌNG` **PHẢI** điền
- Các dòng `Optional` có thể bỏ trống (features sẽ bị disable)

### Bước 6: Tạo thư mục logs

```bash
mkdir logs
```

---

## 7. Cài đặt Frontend

### Bước 1: Navigate to frontend

```bash
cd ../frontend
# Hoặc từ root: cd d:\DownloadLT\UIT\jib\admin_website\frontend
```

### Bước 2: Install Dependencies

```bash
npm install
```

**Thời gian**: 1-3 phút

Nếu lỗi, thử:
```bash
npm cache clean --force
npm install
```

### Bước 3: Kiểm tra file .env

File `frontend/.env` đã có sẵn:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

Không cần sửa gì nếu chạy backend ở port 8000.

---

## 8. Chạy ứng dụng

### Terminal 1: Backend

```bash
# Activate venv nếu chưa
cd d:\DownloadLT\UIT\jib\admin_website\backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Chạy backend
python main.py
```

**Kết quả mong đợi**:
```
INFO:     🚀 Starting AI News Management System...
INFO:     ✅ Connected to MongoDB Atlas
INFO:     ✅ Created MongoDB indexes
INFO:     Started server process [PID]
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Backend chạy tại**: http://localhost:8000

**API Documentation**: http://localhost:8000/api/docs

### Terminal 2: Frontend

Mở terminal mới:

```bash
cd d:\DownloadLT\UIT\jib\admin_website\frontend

npm run dev
```

**Kết quả mong đợi**:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**Frontend chạy tại**: http://localhost:3000

---

## 9. Kiểm tra

### A. Kiểm tra Backend

**1. Health Check:**
```bash
curl http://localhost:8000/health
```

**Kết quả**:
```json
{
  "status": "healthy",
  "app": "AI News Management System",
  "version": "1.0.0",
  "environment": "development"
}
```

**2. API Documentation:**

Truy cập: http://localhost:8000/api/docs

Bạn sẽ thấy Swagger UI với tất cả endpoints.

### B. Kiểm tra Frontend

**1. Mở trình duyệt:**

http://localhost:3000

**2. Test Login:**
- Chưa có user? → Cần tạo user đầu tiên qua API

**Tạo admin user:**

Dùng Swagger UI (http://localhost:8000/api/docs):
1. Tìm **POST /api/v1/auth/register**
2. Click **"Try it out"**
3. Điền:
```json
{
  "email": "admin@example.com",
  "username": "admin",
  "full_name": "Administrator",
  "password": "Admin123456",
  "role": "admin"
}
```
4. Click **"Execute"**

**Hoặc dùng curl:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "username": "admin",
    "full_name": "Administrator",
    "password": "Admin123456",
    "role": "admin"
  }'
```

**3. Login:**
- Email: `admin@example.com`
- Password: `Admin123456`

### C. Kiểm tra RabbitMQ

Truy cập: http://localhost:15672
- Username: `guest`
- Password: `guest`

Bạn sẽ thấy dashboard với queues:
- `article_processing_queue`
- `email_sending_queue`
- `analytics_queue`

---

## 10. Troubleshooting

### ❌ Lỗi: MongoDB connection failed

**Nguyên nhân**: Connection string sai hoặc IP chưa được whitelist

**Giải pháp**:
1. Kiểm tra `MONGODB_URI` trong `.env`
2. Kiểm tra password đã thay đúng chưa
3. Vào MongoDB Atlas → Network Access → Kiểm tra 0.0.0.0/0 có trong list
4. Thử test connection:
```bash
pip install pymongo[srv]
python -c "from pymongo import MongoClient; print(MongoClient('YOUR_URI').admin.command('ping'))"
```

### ❌ Lỗi: OpenAI API key invalid

**Nguyên nhân**: API key sai hoặc hết credit

**Giải pháp**:
1. Kiểm tra `OPENAI_API_KEY` trong `.env`
2. Đảm bảo key bắt đầu với `sk-`
3. Kiểm tra credit: https://platform.openai.com/account/usage
4. Nếu hết credit, nạp thêm hoặc dùng Gemini

### ❌ Lỗi: RabbitMQ connection refused

**Nguyên nhân**: RabbitMQ chưa chạy

**Giải pháp**:
```bash
# Kiểm tra RabbitMQ running
# Docker:
docker ps | grep rabbitmq

# Windows:
rabbitmqctl status

# macOS:
brew services list | grep rabbitmq

# Linux:
sudo systemctl status rabbitmq-server

# Nếu không chạy, start lại:
# Docker: docker start rabbitmq
# Windows: rabbitmq-service start
# macOS: brew services start rabbitmq
# Linux: sudo systemctl start rabbitmq-server
```

### ❌ Frontend lỗi: Network Error

**Nguyên nhân**: Backend chưa chạy hoặc CORS issue

**Giải pháp**:
1. Kiểm tra backend đang chạy: http://localhost:8000/health
2. Kiểm tra `CORS_ORIGINS` trong backend `.env` có `http://localhost:3000`
3. Hard refresh browser: `Ctrl + Shift + R`
4. Clear browser cache

### ❌ Lỗi: Module not found

**Backend:**
```bash
pip install -r requirements.txt
```

**Frontend:**
```bash
npm install
```

### ❌ Port 8000 hoặc 3000 already in use

**Giải pháp**:

**Windows:**
```powershell
# Tìm process
netstat -ano | findstr :8000

# Kill process (thay PID)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Tìm process
lsof -i :8000

# Kill process
kill -9 <PID>
```

Hoặc đổi port:
- Backend: Sửa `PORT=8001` trong `.env`
- Frontend: Chạy `npm run dev -- --port 3001`

---

## 🎉 Hoàn thành!

Giờ bạn có thể:

1. **Đăng nhập Admin**: http://localhost:3000/login
2. **Tạo bài viết mới**: /admin/articles/new
3. **Xem API docs**: http://localhost:8000/api/docs
4. **Test AI features**: Tạo bài viết → AI tự động tóm tắt, phân loại

---

## 📚 Tài liệu thêm

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)

---

## 💡 Tips

1. **Tiết kiệm OpenAI credit**: 
   - Dùng Gemini thay vì GPT-4o (free)
   - Giảm `max_tokens` trong requests

2. **Debug dễ hơn**:
   - Xem logs backend trong terminal
   - Mở DevTools (F12) trong browser để xem network requests

3. **Restart nhanh**:
   - Backend: `Ctrl+C` → `python main.py`
   - Frontend: `Ctrl+C` → `npm run dev`

---

**Version**: 1.0.0
**Last Updated**: October 2025
