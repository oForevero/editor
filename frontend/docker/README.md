## 构建docker镜像方式
1.先执行package的 build，将项目构建成dist文件并供镜像使用

2.配置docker下的 nginx.conf，调整端口为项目所需端口，和镜像端口同步

3.打包

🛠️将打包文件的目录分配为如下格式：
```text
project/
    ├─ dist/
    ├─ docker/
        ├─ nginx.conf
    ├─ Dockerfile
```

如果本地有docker，直接执行Docker file

✅ 如果没有，则将dist, docker文件夹 打包上传到有互联网的linux服务器上，然后执行以下命令
```console
docker build -t umo-editor:latest . 
```
🚨镜像制作好后，如部署服务器无外网需要执行镜像导出，并在服务器上进行安装后部署

```console
docker save -o image.tar 镜像:版本号
```
导入所需指令
```console
docker load -i image.tar 
```

4.✅ 如果无需，则创建对应配置文件后启动

路径映射为如下格式
```text
umo-editor/
├── nginx.conf
├── config.js
```
创建文件夹并进入，上传nginx.conf和config.js，config.js 再public 下
```console
mkdir umo-editor
cd umo-editor
```
启动服务
```console
docker run -d \
  --name umo-editor \
  -p 3000:3000 \
  -v $(pwd)/config.js:/usr/share/nginx/html/config.js \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf \
  umo-editor:latest
```
