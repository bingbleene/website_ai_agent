# AI News Hub - Hệ thống Quản lý Tin tức Thông minh 🤖📰

> Nền tảng tin tức tự động với **23 AI Agents** - Tạo nội dung, quản lý bài đăng, phân tích user, và tương tác thông minh

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)

---

## 📑 Mục lục

1. [Mô tả Dự án](#1-mô-tả-dự-án)
2. [Kiến trúc Hệ thống](#2-kiến-trúc-hệ-thống)
3. [Cài đặt](#3-cài-đặt)
4. [Hướng dẫn Sử dụng](#4-hướng-dẫn-sử-dụng)
5. [API Documentation](#5-api-documentation)
6. [Tech Stack](#6-tech-stack)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. MÔ TẢ DỰ ÁN

### 1.1 Tổng quan

**AI News Hub** là hệ thống quản lý tin tức toàn diện với kiến trúc **Multi-Agent AI** (23 agents), tự động hóa toàn bộ quy trình từ tạo nội dung đến phân tích người dùng.

**Thành phần chính:**
- 🎨 **Frontend**: React 18 + Vite (Admin Dashboard + Public Website)
- ⚙️ **Backend**: FastAPI + Python 3.11
- 🤖 **AI Layer**: 23 AI Agents (6 nhóm chuyên biệt)
- 💾 **Database**: MongoDB Atlas (Cloud)

### 1.2 Tính năng nổi bật

#### 1.2.1 Cho Admin
- 📊 Dashboard thống kê realtime (views, users, comments)
- 📝 Quản lý bài viết với **AI Agent Logs** chi tiết
- 📂 Quản lý categories (màu sắc tùy chỉnh)
- 👥 Quản lý users (roles: Admin/Editor/Author/User)
- ⚙️ Settings (Profile, App, Notifications, API, System)

#### 1.2.2 Cho Public (Người đọc)
- 📰 Đọc bài viết (HTML content đầy đủ, hình ảnh)
- 💬 Bình luận + Like/Unlike
- 🤖 AI Chatbot thông minh (context-aware)
- 🔍 Tìm kiếm & lọc theo category

#### 1.2.3 Tự động hóa AI
- ✍️ Tự động viết bài (từ topic → full article)
- 🖼️ Tự động thu thập hình ảnh
- 🔍 Kiểm duyệt nội dung + fact-checking
- 🌐 Dịch tự động (Việt → Anh)
- 📅 Sắp xếp và đăng bài tự động
- 📧 Gửi email digest hàng ngày
- 📊 Phân tích hành vi đọc + đề xuất chủ đề

### 1.3 Thống kê Dự án

| Metric | Giá trị |
|--------|---------|
| **Frontend** | 15+ React components |
| **Backend** | 15+ API endpoints |
| **AI Agents** | 23 agents (6 managers) |
| **Database** | 5 collections (MongoDB) |
| **Lines of Code** | ~5,000+ lines |
| **Mock Data** | 10 articles, 10 users, 9 categories |

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1 Sơ đồ Tổng quan

```
┌────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                     │
│  ┌──────────────────┐              ┌──────────────────────┐    │
│  │  Public Website  │              │  Admin Dashboard     │    │
│  │  - Home          │              │  - Dashboard         │    │
│  │  - Articles      │              │  - Articles Mgmt     │    │
│  │  - Detail+Chat   │              │  - Categories        │    │
│  │  - Comments      │              │  - Users             │    │
│  └──────────────────┘              │  - Settings          │    │
│                                    └──────────────────────┘    │
└─────────────────────┬──────────────────────────────────────────┘
                      │ REST API
                      ▼
┌────────────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI + Python)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API Routes Layer                            │  │
│  │  /auth  /articles  /users  /comments  /chatbot          │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              AI MULTI-AGENT SYSTEM (23 Agents)           │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │    MASTER COORDINATOR AGENT (Điều phối tổng)    │   │  │
│  │  └────────────┬────────────┬────────────┬──────────┘   │  │
│  │               │            │            │              │  │
│  │    ┌──────────▼──┐  ┌─────▼─────┐  ┌──▼─────────┐    │  │
│  │    │Content Mgr  │  │Post Mgr   │  │User Mgr    │    │  │
│  │    │(5 agents)   │  │(4 agents) │  │(4 agents)  │    │  │
│  │    └─────────────┘  └───────────┘  └────────────┘    │  │
│  │    ┌──────────────┐  ┌────────────────────────────┐   │  │
│  │    │Analytics Mgr │  │Technical Mgr (2 agents)    │   │  │
│  │    │(5 agents)    │  │                            │   │  │
│  │    └──────────────┘  └────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────┬──────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────────┐
│                   DATABASE (MongoDB Atlas)                     │
│  Collections: articles, users, comments, categories, ai_logs   │
│  Features: Vector Search, Full-text Search, Aggregation       │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Kiến trúc AI Multi-Agent (23 Agents)

#### 2.2.1 Master Coordinator Agent (Cấp 1)
**Vai trò**: Điều phối tổng thể, ra quyết định cấp cao, giải quyết conflict

**Quản lý**: 5 manager agents

---

#### 2.2.2 Content Manager Agent (Cấp 2)
**Nhiệm vụ**: Quản lý toàn bộ quy trình tạo nội dung

**Bao gồm 5 agents**:

| # | Agent | Chức năng |
|---|-------|-----------|
| 1 | **Source Finder Agent** | Tìm nguồn thông tin uy tín (web scraping, API) |
| 2 | **Content Writer Agent** | Viết bài từ topic (GPT-4o-mini) |
| 3 | **Image Collector Agent** | Thu thập hình ảnh từ Unsplash/DALL-E |
| 4 | **Content Moderator Agent** | Kiểm duyệt nội dung, fact-checking |
| 5 | **Translation Agent** | Dịch bài Việt → Anh (hoặc ngược lại) |

**Luồng hoạt động**:
```
Topic → Source Finder → Content Writer → Image Collector 
     → Content Moderator → Translation → Bài viết hoàn chỉnh
```

---

#### 2.2.3 Post Manager Agent (Cấp 2)
**Nhiệm vụ**: Quản lý bài đăng, phân loại, đề xuất

**Bao gồm 4 agents**:

| # | Agent | Chức năng |
|---|-------|-----------|
| 6 | **Scheduler Agent** | Sắp xếp lịch đăng bài tự động |
| 7 | **Categorization Agent** | Phân loại + gắn tag tự động |
| 8 | **Recommendation Agent** | Gợi ý bài viết liên quan (Vector Search) |
| 9 | **Daily Summary Agent** | Tổng hợp tin tức trong ngày |

**Luồng hoạt động**:
```
Bài viết mới → Categorization → Scheduler → Đăng bài
            → Recommendation → Hiển thị "Related Articles"
Cuối ngày → Daily Summary → Email digest
```

---

#### 2.2.4 User Manager Agent (Cấp 2)
**Nhiệm vụ**: Quản lý user, tương tác, engagement

**Bao gồm 4 agents**:

| # | Agent | Chức năng |
|---|-------|-----------|
| 10 | **User Profile Agent** | Quản lý thông tin user (CRUD) |
| 11 | **Email Digest Agent** | Gửi email tóm tắt tin hàng ngày |
| 12 | **Comment Interaction Agent** | Phản hồi bình luận (AI chatbot) |
| 13 | **User Engagement Agent** | Theo dõi hoạt động, gửi notification |

**Luồng hoạt động**:
```
User đăng ký → User Profile Agent → Tạo profile
User comment → Comment Interaction Agent → AI reply
Cuối ngày → Email Digest Agent → Gửi tin nổi bật
User không active → Engagement Agent → Gửi reminder
```

---

#### 2.2.5 Analytics Manager Agent (Cấp 2)
**Nhiệm vụ**: Phân tích dữ liệu, đề xuất chiến lược

**Bao gồm 5 agents**:

| # | Agent | Chức năng |
|---|-------|-----------|
| 14 | **Post Statistics Agent** | Thống kê views, likes, shares |
| 15 | **Reading Behavior Agent** | Phân tích hành vi đọc (dwell time, scroll depth) |
| 16 | **Content Performance Agent** | Đánh giá hiệu suất bài viết |
| 17 | **Topic Suggestion Agent** | Đề xuất chủ đề mới trending |
| 18 | **User Analysis Agent** | Phân tích demographics, preferences |

**Output**:
- Dashboard charts & metrics
- Recommendations cho editors
- Trending topics để viết bài

---

#### 2.2.6 Technical Manager Agent (Cấp 2)
**Nhiệm vụ**: Giám sát hệ thống, logging

**Bao gồm 2 agents**:

| # | Agent | Chức năng |
|---|-------|-----------|
| 19 | **System Health Agent** | Kiểm tra database, API, services |
| 20 | **Activity Logger Agent** | Ghi log của 22 agents còn lại |

**Monitoring**:
- Database connection status
- API response times
- AI token usage
- Error tracking

---

### 2.3 Data Flow (Luồng dữ liệu)

#### 2.3.1 Flow: Tạo bài viết tự động
```
1. Admin nhập topic → Master Coordinator
2. Master → Content Manager
3. Source Finder → Tìm nguồn
4. Content Writer → Viết bài (GPT-4o)
5. Image Collector → Lấy ảnh
6. Content Moderator → Kiểm duyệt
7. Translation → Dịch (nếu cần)
8. Lưu MongoDB
9. Post Manager → Categorization → Scheduler
10. Đăng bài tự động
11. Analytics → Tracking performance
```

#### 2.3.2 Flow: User đọc bài + chatbot
```
1. User truy cập /article/:id
2. Frontend lấy article + related articles (Recommendation Agent)
3. User hỏi chatbot
4. Comment Interaction Agent → GPT-4o → Trả lời
5. Reading Behavior Agent → Track (time, scroll)
6. Lưu analytics
```

#### 2.3.3 Flow: Email digest hàng ngày
```
1. Cron job 8AM hàng ngày
2. Daily Summary Agent → Tổng hợp bài hot
3. Email Digest Agent → Tạo email HTML
4. Gửi đến tất cả users subscribed
5. Activity Logger → Ghi log
```

---

## 3. CÀI ĐẶT

### 3.1 Yêu cầu Hệ thống

| Component | Version |
|-----------|---------|
| Node.js | 18.0+ |
| Python | 3.11+ |
| MongoDB | Latest (hoặc Atlas) |
| Git | Latest |

### 3.2 Quick Start (Chạy với Mock Data)

#### 3.2.1 Frontend (Độc lập - không cần backend)

```bash
# Clone repo
git clone <repo-url>
cd admin_website/frontend

# Cài đặt
npm install

# Chạy dev server
npm run dev
```

✅ **Mở**: `http://localhost:5173`

**Mock Login**: Chọn role (Admin/Editor/Author/User) → Login

**Mock Data có sẵn**:
- 10 bài viết (HTML content + images)
- 10 users (với roles)
- 9 categories (với màu sắc)
- AI Agent Logs mẫu

---

#### 3.2.2 Backend (Kết nối MongoDB + OpenAI)

```bash
cd admin_website/backend

# Tạo virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo .env
cp .env.example .env
```

**Chỉnh sửa `.env`**:
```env
# MongoDB Atlas
MONGODB_URL=mongodb+srv://ai_news_db:Teamnews123@ai-news-cluster.zdmuvnp.mongodb.net/ainews

# JWT Secret
SECRET_KEY=your-secret-key-min-32-chars

# OpenAI
OPENAI_API_KEY=sk-proj-...

# CORS
CORS_ORIGINS=["http://localhost:5173"]
```

**Chạy server**:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ **API Docs**: `http://localhost:8000/docs`

---

### 3.3 Setup MongoDB Atlas

**Bước 1**: Tạo tài khoản tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

**Bước 2**: Tạo Cluster (Free M0)

**Bước 3**: Database Access → Add User (username + password)

**Bước 4**: Network Access → Add IP (0.0.0.0/0 hoặc IP cụ thể)

**Bước 5**: Connect → Get connection string → Paste vào `.env`

**Bước 6**: Tạo Database `ainews` với collections:
- `articles`
- `users`
- `comments`
- `categories`
- `ai_logs`

---

### 3.4 Scripts Tiện ích

**Windows**:
```bash
# Chạy backend
.\start_backend.bat

# Chạy frontend
.\start_frontend.bat

# Setup tất cả
.\setup.bat
```

**Linux/macOS**:
```bash
chmod +x *.sh

# Chạy backend
./start_backend.sh

# Chạy frontend
./start_frontend.sh

# Setup
./setup.sh
```

---

## 4. HƯỚNG DẪN SỬ DỤNG

### 4.1 Public Website (Người đọc)

#### 4.1.1 Trang chủ - `/`
- Hero section với featured article
- Grid danh sách bài viết mới nhất
- Search bar + category filter

#### 4.1.2 Danh sách bài viết - `/articles`
- Hiển thị tất cả bài viết
- Tìm kiếm theo tiêu đề
- Lọc theo category (AI, Technology, Science...)
- Pagination

#### 4.1.3 Chi tiết bài viết - `/article/:id`

**Nội dung**:
- Tiêu đề, tác giả, ngày đăng
- HTML content đầy đủ (headings, paragraphs, images)
- CSS styling chuyên nghiệp (`.article-content`)

**Bình luận**:
- Đọc comments của người khác
- Thêm comment mới (cần login)
- Like/Unlike comment
- Avatar + tên + thời gian

**AI Chatbot**:
- Click nút chat (góc dưới phải)
- Chatbot hiểu context bài viết
- Hỏi về key points, implications, predictions
- Nhận câu trả lời chi tiết từ AI

---

### 4.2 Admin Dashboard

#### 4.2.1 Dashboard - `/admin`

**Stats Cards (4 cards)**:
- 📊 Total Articles
- 👥 Total Users
- 👁️ Total Views
- 💬 Total Comments

**Charts**:
- Line chart: Views theo 7 ngày
- Bar chart: Bài viết theo category

**Recent Activity**:
- Bài viết mới nhất
- Comments mới
- Users mới

---

#### 4.2.2 Quản lý Bài viết - `/admin/articles`

**Table View**:
- Columns: Title, Author, Category, Status, Views, Date, Actions
- Badge "AI" cho bài viết có AI logs

**Thao tác**:
- **View**: Xem chi tiết + AI Agent Logs
- **Edit**: Chỉnh sửa nội dung
- **Delete**: Xóa bài viết (có xác nhận)

**Search & Filter**:
- Search box: Tìm theo tiêu đề
- Status filter: All / Published / Draft / Pending
- Category filter: All categories

---

#### 4.2.3 Chi tiết + AI Logs - `/admin/articles/:id`

**Tab 1: Article Content**
- Hiển thị full HTML content
- Preview như public page

**Tab 2: AI Agent Logs** ⭐

**Summary Cards**:
1. **Total Agents Used**: Số lượng agents đã chạy
2. **Total Processing Time**: Tổng thời gian (giây)
3. **Success Rate**: % thành công
4. **Quality Score**: Điểm chất lượng /10

**Agent Logs Detail** (expandable):

1. **Content Writer Agent**
   - Duration: ~35s
   - Tokens: ~45,000
   - Model: GPT-4o-mini
   - Output: Full article HTML
   - Logs: Step-by-step generation

2. **Source Finder Agent**
   - Duration: ~12s
   - Tokens: ~8,000
   - Sources found: 5-10 URLs
   - Reliability scores
   - Logs: Scraping process

3. **Content Moderator Agent**
   - Duration: ~18s
   - Tokens: ~15,000
   - Fact-check results
   - Accuracy score: 95%
   - Logs: Verification steps

4. **Image Collector Agent**
   - Duration: ~22s
   - Images found: 3-5
   - Sources: Unsplash/DALL-E
   - Logs: Selection criteria

5. **Translation Agent** (nếu có)
   - Duration: ~15s
   - Source: Vietnamese
   - Target: English
   - Quality score: 90%

**Log Colors**:
- 🔵 Info
- 🟢 Success
- 🟡 Warning
- 🔴 Error

---

#### 4.2.4 Quản lý Categories - `/admin/categories`

**Stats**:
- Total Categories
- Most Popular
- Total Articles

**Grid View (3x3)**:
- Mỗi card hiển thị:
  - Color badge
  - Category name
  - Article count
  - Edit & Delete buttons

**Thao tác**:
1. **Search**: Tìm theo tên
2. **Add Category**:
   - Name
   - Slug (URL-friendly)
   - Description
   - Color (color picker)
3. **Edit**: Cập nhật thông tin
4. **Delete**: Xóa category

---

#### 4.2.5 Quản lý Users - `/admin/users`

**Stats**:
- Total Users
- Active Users
- Admins
- Authors

**Table View**:
- Columns: User (avatar+name+email), Role, Status, Articles, Joined, Actions
- Role badges: Admin (red), Editor (blue), Author (green), User (gray)

**Filters**:
- Search: Tìm theo name/email
- Role: All / Admin / Editor / Author / User
- Status: All / Active / Inactive

**Thao tác**:
- Toggle active/inactive
- Edit role & info
- Delete user

---

#### 4.2.6 Settings - `/admin/settings`

**5 Tabs**:

**1. Profile Settings** 👤
- Avatar upload
- Full Name
- Email
- Bio
- Change Password (với show/hide toggle)

**2. Application Settings** ⚙️
- Site Name
- Site Description
- Timezone
- Language (EN/VI/ES/FR/DE)
- Date Format

**3. Notification Settings** 🔔
- Email Notifications
- Push Notifications
- New Article Alert
- New Comment Alert
- Weekly Digest
- Security Alerts

**4. API Settings** 🔑
- API Key (masked)
- API Endpoint
- Rate Limit (requests/min)
- Timeout

**5. System Info** 📊
- App Version (v1.0.0)
- Database Status
- Storage Used
- API Calls Today
- Environment info

---

## 5. API DOCUMENTATION

### 5.1 Authentication

**POST** `/api/v1/auth/register`
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe"
}
```

**POST** `/api/v1/auth/login`
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

---

### 5.2 Articles

**GET** `/api/v1/articles?skip=0&limit=20&category=AI`

**Response**:
```json
{
  "items": [...],
  "total": 50,
  "skip": 0,
  "limit": 20
}
```

**GET** `/api/v1/articles/{id}`

**POST** `/api/v1/articles` (Auth required)
```json
{
  "title": "Article Title",
  "content": "<p>HTML content</p>",
  "category": "Technology",
  "status": "draft"
}
```

**PUT** `/api/v1/articles/{id}` (Auth)

**DELETE** `/api/v1/articles/{id}` (Admin only)

---

### 5.3 AI Agents

**POST** `/api/v1/ai/generate-article`
```json
{
  "topic": "Latest AI trends in 2025",
  "category": "AI",
  "language": "vi"
}
```

**Response**:
```json
{
  "article_id": "...",
  "content": "...",
  "images": [...],
  "ai_logs": {
    "agents_used": 5,
    "total_time": 102.5,
    "success_rate": 100
  }
}
```

---

## 6. TECH STACK

### 6.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Library |
| Vite | 5.0.8 | Build tool |
| React Router | 6.21.0 | Routing |
| Zustand | 4.4.7 | State management |
| Axios | 1.6.5 | HTTP client |
| Lucide React | Latest | Icons |

### 6.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.109.0+ | Web framework |
| Python | 3.11+ | Language |
| Uvicorn | 0.27.0+ | ASGI server |
| PyMongo | 4.0+ | MongoDB driver |
| Pydantic | 2.0+ | Validation |

### 6.3 AI & Database

| Service | Purpose |
|---------|---------|
| OpenAI GPT-4o-mini | Content generation, chatbot |
| OpenAI DALL-E 3 | Image generation |
| OpenAI Embeddings | Vector search |
| MongoDB Atlas | Cloud database |
| Atlas Vector Search | Semantic search |

---

## 7. TROUBLESHOOTING

### 7.1 Frontend Issues

**❌ `npm install` failed**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**❌ Port 5173 used**
```js
// vite.config.js
export default {
  server: { port: 3000 }
}
```

**❌ White screen**
- Check console (F12)
- Verify routes in `App.jsx`

---

### 7.2 Backend Issues

**❌ Python version wrong**
```bash
python --version  # Cần 3.11+
python3.11 -m venv venv
```

**❌ MongoDB connection failed**
- Check connection string
- Whitelist IP (0.0.0.0/0)
- Verify username/password

**❌ OpenAI API errors**
- Check API key valid
- Check credit balance
- Rate limit: wait 1 minute

**❌ Port 8000 used**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :8000
kill -9 <PID>
```

---

### 7.3 Common Errors

| Error | Solution |
|-------|----------|
| `ModuleNotFoundError` | `pip install -r requirements.txt` |
| `Connection refused` | Check server running |
| `401 Unauthorized` | Check JWT token |
| `CORS blocked` | Add origin to `CORS_ORIGINS` |
| `500 Internal Error` | Check backend logs |

---

## 8. PROJECT INFO

### 8.1 File Structure

```
admin_website/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin pages
│   │   │   └── public/     # Public pages
│   │   ├── services/       # Mock data + API
│   │   └── store/          # Zustand store
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── api/v1/         # API routes
│   │   ├── core/           # Config, security, db
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # Business logic
│   │   └── agents/         # 23 AI Agents
│   ├── main.py
│   └── requirements.txt
│
├── README.md               # This file
├── setup.bat/sh            # Setup scripts
└── docker-compose.yml      # Docker config
```

### 8.2 Contributors

- **Project Lead**: AI News Hub Team
- **AI Architecture**: Multi-Agent System (23 agents)
- **Frontend**: React + Vite + Inline Styles
- **Backend**: FastAPI + Python 3.11
- **AI Provider**: OpenAI (GPT-4o-mini, DALL-E 3)

### 8.3 License

MIT License - See [LICENSE](LICENSE)

### 8.4 Roadmap

**Phase 1** ✅: Core features (Dashboard, Articles, AI Logs)  
**Phase 2** 🔄: Real AI agents implementation  
**Phase 3** 📋: Vector search, recommendations  
**Phase 4** 🚀: Mobile app, real-time features

---

## 9. SUPPORT

- **GitHub**: [Issues](https://github.com/yourusername/ai-news-hub/issues)
- **Email**: support@ainewshub.com
- **Docs**: [Wiki](https://github.com/yourusername/ai-news-hub/wiki)

---

**🎉 Built with ❤️ using React + FastAPI + OpenAI**

**Version 1.0.0** | **Last Updated: October 2025**

**⭐ Star this repo if you find it useful!**
