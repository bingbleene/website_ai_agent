# 🐳 Docker Quick Start Guide

## Yêu cầu
- Docker Desktop đã cài và đang chạy
- File `.env` đã được cấu hình đúng

## Khởi động toàn bộ hệ thống

```bash
# Build và chạy tất cả services
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Xem logs của từng service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f rabbitmq
docker-compose logs -f ai_news_worker
```

## Dừng hệ thống

```bash
# Dừng tất cả containers
docker-compose down

# Dừng và xóa volumes (reset database)
docker-compose down -v
```

## Kiểm tra containers

```bash
# Xem các container đang chạy
docker ps

# Xem tất cả containers
docker ps -a
```

## Truy cập services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## Troubleshooting

### Container không start
```bash
# Xem logs chi tiết
docker-compose logs backend
docker-compose logs frontend

# Restart một service cụ thể
docker-compose restart backend
```

### Rebuild sau khi sửa code
```bash
# Rebuild và restart
docker-compose up -d --build

# Rebuild một service cụ thể
docker-compose up -d --build backend
```

### Xóa tất cả và start lại từ đầu
```bash
# Dừng và xóa containers + volumes
docker-compose down -v

# Xóa images cũ
docker-compose rm -f

# Build và chạy lại
docker-compose up -d --build
```

## Development với Docker

### Chỉnh sửa code
- Code trong `backend/` và `frontend/` được mount vào containers
- Backend auto-reload khi có thay đổi
- Frontend auto-reload khi có thay đổi

### Cài thêm package

**Backend:**
```bash
# Vào container
docker-compose exec backend /bin/bash

# Cài package
pip install <package-name>

# Hoặc chỉnh sửa requirements.txt và rebuild
docker-compose up -d --build backend
```

**Frontend:**
```bash
# Vào container
docker-compose exec frontend /bin/sh

# Cài package
npm install <package-name>

# Hoặc chỉnh sửa package.json và rebuild
docker-compose up -d --build frontend
```

## Tips

1. **Xem resource usage:**
   ```bash
   docker stats
   ```

2. **Clean up không gian:**
   ```bash
   docker system prune -a
   ```

3. **Export logs:**
   ```bash
   docker-compose logs > logs.txt
   ```

4. **Chạy command trong container:**
   ```bash
   docker-compose exec backend python manage.py
   docker-compose exec frontend npm run build
   ```

---

**Lưu ý:** Lần đầu build sẽ mất 5-10 phút. Các lần sau sẽ nhanh hơn nhiều.
