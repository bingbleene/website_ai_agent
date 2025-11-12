# Sử dụng base image
FROM node:lts-alpine

# Đặt thư mục làm việc
WORKDIR /app

# Sao chép và cài đặt dependencies
# Đảm bảo bạn có 2 dòng này:
COPY package.json package-lock.json ./
RUN npm install 

# Sao chép các file code còn lại
COPY . .

# Khai báo port (đã có trong docker-compose, nhưng tốt nhất nên có)
EXPOSE 3000

# Lệnh chạy ứng dụng (đã có trong docker-compose.yml)
#CMD ["npm", "run", "dev", "--", "--host"]