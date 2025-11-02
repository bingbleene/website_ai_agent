# 🚀 Quick Start - Minimal Setup

## Chỉ cần 3 bước để chạy hệ thống!

### ✅ Bước 1: Cài đặt dependencies

```bash
# Tạo virtual environment (nếu chưa có)
python -m venv venv

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Cài đặt packages
pip install -r requirements.txt
```

### ✅ Bước 2: Cấu hình .env file

File `.env` đã được tạo sẵn với cấu hình tối thiểu. Bạn CHỈ CẦN:

1. **MongoDB URI** - ✅ ĐÃ CÓ (mongodb+srv://ngocbich:...)
2. **OpenAI API Key** - ✅ ĐÃ CÓ (sk-proj-...)

**Không cần** các API key khác! Hệ thống sẽ tự động dùng fallback:

| Service | Fallback Behavior |
|---------|-------------------|
| **Google Cloud** | Dùng Gemini API hoặc OpenAI để dịch thuật |
| **AWS Personalize** | Gợi ý bài viết dựa vào "popular articles" |
| **AWS SES** | Log email thay vì gửi thực |
| **RabbitMQ** | Chạy tasks đồng bộ (sync) thay vì async |
| **Redis** | Không cache (query trực tiếp database) |

### ✅ Bước 3: Chạy server

```bash
# Chạy backend
python -m uvicorn main:app --reload

# Hoặc dùng script có sẵn:
# Windows:
..\start_backend.bat
# Linux/Mac:
../start_backend.sh
```

Server sẽ chạy tại: **http://localhost:8000**

---

## 🧪 Test API

### Health Check
```bash
curl http://localhost:8000/health
```

### Đăng ký user mới
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "full_name": "Administrator",
    "role": "admin"
  }'
```

### Đăng nhập
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Tạo article mới
```bash
# Lấy access_token từ response của /login
curl -X POST http://localhost:8000/api/v1/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Bài viết test",
    "content": "Nội dung bài viết...",
    "category": "technology",
    "tags": ["ai", "tech"]
  }'
```

---

## 📝 Các tính năng hoạt động với cấu hình minimal

✅ **Hoạt động bình thường:**
- ✅ Đăng ký / Đăng nhập
- ✅ Quản lý users
- ✅ Tạo / Sửa / Xóa bài viết
- ✅ AI enhance articles (OpenAI GPT-4o)
- ✅ Summarization & hashtags (OpenAI)
- ✅ Categorization (OpenAI)
- ✅ Embedding & Vector Search (MongoDB Atlas)
- ✅ Content moderation (OpenAI Moderation API)
- ✅ Comments & sentiment analysis (fallback: keyword-based)
- ✅ Analytics tracking
- ✅ Dashboard statistics
- ✅ Chatbot với RAG (OpenAI + MongoDB Vector Search)

⚠️ **Chức năng limited (dùng fallback):**
- ⚠️ Translation: Dùng Gemini API (đã có key) hoặc OpenAI
- ⚠️ Recommendations: Dựa vào popular articles thay vì personalized
- ⚠️ Email notifications: Log ra console thay vì gửi thực

❌ **Tắt (không ảnh hưởng chính):**
- ❌ RabbitMQ async processing → Chạy đồng bộ
- ❌ Redis caching → Query trực tiếp MongoDB

---

## 🔧 Nâng cấp sau (optional)

Khi cần, bạn có thể thêm các service này:

### 1. RabbitMQ (Async processing - tăng tốc)
```bash
# Docker:
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management

# Hoặc dùng CloudAMQP (miễn phí):
# https://www.cloudamqp.com/
```

Thêm vào `.env`:
```bash
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

### 2. Redis (Caching - tăng tốc)
```bash
# Docker:
docker run -d --name redis -p 6379:6379 redis

# Hoặc dùng Redis Cloud (miễn phí):
# https://redis.com/try-free/
```

Thêm vào `.env`:
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Google Cloud APIs (Translation & Sentiment)
1. Tạo project tại: https://console.cloud.google.com/
2. Enable APIs: Cloud Translation + Cloud Natural Language
3. Tạo Service Account Key (JSON)
4. Thêm vào `.env`:
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/credentials.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

### 4. AWS Services (Personalization & Email)
1. Tạo IAM user với quyền: Personalize + SES
2. Thêm vào `.env`:
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_PERSONALIZE_CAMPAIGN_ARN=arn:aws:personalize:...
AWS_SES_SENDER_EMAIL=your-verified-email@domain.com
```

---

## 🐛 Troubleshooting

### Lỗi: ModuleNotFoundError
```bash
pip install -r requirements.txt
```

### Lỗi: MongoDB connection failed
- Kiểm tra `MONGODB_URI` trong `.env`
- Đảm bảo MongoDB Atlas cho phép IP của bạn (0.0.0.0/0 để test)

### Lỗi: OpenAI API error
- Kiểm tra `OPENAI_API_KEY` trong `.env`
- Đảm bảo có credits trong tài khoản OpenAI

### Backend chạy nhưng không có response
- Kiểm tra CORS settings trong `main.py`
- Frontend phải chạy trên `localhost:3000` hoặc `localhost:5173`

---

## 📚 Tài liệu chi tiết

- **Full Documentation**: [README.md](../README.md)
- **Detailed Setup**: [SETUP_LOCAL.md](../SETUP_LOCAL.md)
- **API Reference**: [README.md#api-endpoints](../README.md#api-endpoints)
- **Changelog**: [CHANGELOG.md](../CHANGELOG.md)

---

## 🎯 Next Steps

1. ✅ Chạy backend với cấu hình minimal
2. 🔲 Setup frontend (React + Vite)
3. 🔲 Test các API endpoints
4. 🔲 Tạo admin user
5. 🔲 Tạo bài viết đầu tiên
6. 🔲 Test AI features (enhance, summarize, chatbot)
7. 🔲 Thêm optional services nếu cần

**Happy coding! 🚀**
