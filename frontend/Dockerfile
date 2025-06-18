# 使用官方 nginx 稳定版镜像
FROM nginx:stable-alpine

# 设置工作目录（可选）
WORKDIR /usr/share/nginx/html

# 清除默认 nginx 静态资源（避免 index.html 冲突）
RUN rm -rf /usr/share/nginx/html/*

# 拷贝前端构建后的静态文件
COPY dist/ /usr/share/nginx/html/

# 拷贝前端配置文件（如环境配置等）
COPY docker/config.js /usr/share/nginx/html/config.js

# 拷贝自定义 nginx 配置文件
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 公开端口（默认 nginx 是 80，如果你在 nginx.conf 中改了成 3000，就用 3000）
EXPOSE 3000

# 容器启动时启动 nginx
CMD ["nginx", "-g", "daemon off;"]
