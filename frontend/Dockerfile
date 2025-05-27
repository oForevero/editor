# 选择官方 nginx 镜像
FROM nginx:stable-alpine

# 复制你的dist文件到 nginx 的默认静态目录
COPY dist /usr/share/nginx/html

# 复制你的自定义 nginx 配置（可选）
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 公开3000端口
EXPOSE 3000

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
