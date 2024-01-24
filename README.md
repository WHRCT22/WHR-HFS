# WHR-HFS Server
# WHR-HFS 服务器
![WHR-HFS](image/cmd.png)
## Introduction
## 介绍
WHR-HFS is a server application that provides file upload, download, and streaming services.
WHR-HFS是一个提供文件上传、下载和流媒体服务的服务器应用程序。

## Installation
## 安装
To install and run the WHR-HFS server, follow these steps:
要安装和运行WHR-HFS服务器，请按照以下步骤操作：

1. Clone the repository
1. 克隆存储库
2. Cd it and install the necessary node modules using `npm install`
2. 使用`npm install`安装必要的节点模块
3. Run the server using `node app.js`
3. 使用`node app.js`命令行来运行服务器

## Features
## 特性
- File Upload and Download
- 文件上传与下载
- Websocket Chat Server
- 基于Websocket的聊天服务
- Notification and Permissions
- 通知和权限
- More...
- 更多

## Usage
Once the server is running, you can access the functionality using the following endpoints:

- File Upload: `/WHR-HFS-API/Upload` [POST]
- File List: `/WHR-HFS-API/Files-list` [GET]
- File Download: `/WHR-HFS-API/Download/{filename}` [GET]
## Web UI
![WHR-HFS](image/web.png)
## Chat room UI
![WHR-HFS](image/chat.png)
## Example
```javascript
// Start the application
const port = 11452;
app.listen({port}, '0.0.0.0', () => {
    // Display server information
    console.log("Application Online");
    console.log("System Status: Running");
    console.log("Local Port: 11452");
    console.log("Server IP: 0.0.0.0");
    console.log("Storage Folder: {uploadfolder}");
    // Display WebSocket information
    console.log("Websocket is running at {wsport}");
    console.log("Url path '{websocketurl}'");
    // Display request information
    console.log("======请求信息显示======");
});
```
## Contributors
##### WHRSTUDIO
##### WZH-Team
## License
This project is licensed under the MIT License - see the LICENSE file for details.
