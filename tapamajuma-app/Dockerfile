# frontend/Dockerfile
# Stage 1: Build React
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Simpan hasil build (image ini kecil, isinya cuma file statis)
FROM alpine:latest
WORKDIR /app
# Kita cuma copy folder 'dist' (hasil build vite)
COPY --from=build /app/dist . 
# Volume shared nanti akan dipakai oleh Nginx
CMD ["sh"]