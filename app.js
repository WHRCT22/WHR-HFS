// 模块引入
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');

// 在服务器端定义一个数组来保存历史消息
const messageHistory = [];

//自定义启动的WS服务器端口
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8084 });
// console.log('');
//定义有WS客户端连接时的操作
wss.on('connection', function connection(ws, req) {
    //获取用户远程IP地址，注意！：“connection”方法弃用故改为“remoteAddress”
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // 首先发送一条包含“你在线了”的JSON信息给新连接的客户端
    ws.send(JSON.stringify("欢迎加入聊天室！"));

    // 逐条发送messageHistory包含的数组给新连接的客户端
// 逐条发送messageHistory包含的数组给新连接的客户端，包含用户IP地址
if (messageHistory.length > 0) {
  messageHistory.forEach(message => {
    const messageStringWithIP = `[${message.from}]: ${message.content}`;
    ws.send(messageStringWithIP);
  });
}
    //此处定义了WS客户端发送信息时的操作
    ws.on('message', function incoming(message) {
      console.log(`[WS用户 \x1b[32m${clientIP}\x1b[0m]: \x1b[33m${message}\x1b[0m
        `);
        //转换用户发送的二进制数据到文本类型
        const messageString = message.toString();

        // 将新消息添加到历史消息数组中
        messageHistory.push({ from: clientIP, content: messageString });

       // 广播消息给所有连接的客户端，带上用户的IP地址
      wss.clients.forEach(function each(client) {
  if (client.readyState === WebSocket.OPEN) {
      const messageWithIP = `[${clientIP}]: ${messageString}`;
      client.send(messageWithIP);
  }
});
    });
});
//定义上传文件目录(此变量具有全局通用性)
const uploadfolder= 'Uploads'

const uploadPath = path.join(process.cwd(), `${uploadfolder}`);

// 创建 Express 应用
const app = express();
// console.log('');

// 设置静态资源路径(嵌入到程序内部故直接使用dir__dirname方法)
app.use(express.static(path.join(__dirname, 'public')));

// 获取文件列表路由
app.get('/WHR-HFS-API/Files-list', (req, res) => {
    const uploadPath = path.join(process.cwd(), `${uploadfolder}`);
    const files = fs.readdirSync(uploadPath);
    const fileList = [];

    files.forEach((file) => {
        const filePath = path.join(uploadPath, file);
        const stats = fs.statSync(filePath);

        const fileData = {
            name: file,
            size: stats.size,
            isDirectory: stats.isDirectory()
        };

        fileList.push(fileData);
    });

    res.json({
        success: true,
        warn: false,
        files: fileList
    });
});

// 下载页面路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});
// About页面
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/about.html'));
});
// 聊天室界面
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/chat.html'));
});

// 设置文件上传限制
const storage = multer.diskStorage({
    destination: uploadPath,
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
  
  const fileFilter = (req, file, callback) => {
    // 解决中文名乱码的问题 latin1 是一种编码格式
    file.originalname = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );
    callback(null, true);
  };
  
  // 创建 multer 对象
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: Infinity, files: Infinity, timeLimit: 60 * 60 * 12  },
  }).array('file');

  // 设置文件上传路由
  app.post('/WHR-HFS-API/Upload', upload, (req, res) => {
    console.log('\x1b[32m[', req.headers['x-forwarded-for'] || req.connection.remoteAddress, ']\x1b[0m\x1b[37m POST \x1b[33m', req.files.map(file => `${file.originalname}`).join(', '), '\x1b[0m');
    console.log(``);

    res.redirect('/');
  });

// 下载文件路由
app.get('/WHR-HFS-API/Download/:file', (req, res) => {
    console.log('\x1b[32m', '[', req.headers['x-forwarded-for'] || req.connection.remoteAddress, ']', '\x1b[0m', '\x1b[37m', 'GET', '\x1b[33m', req.params.file, '\x1b[0m');
    const file = path.join(process.cwd(), `${uploadfolder}`, req.params.file);
    console.log(``);
    if (fs.existsSync(file)) {
        res.sendFile(file);
    } else {
        const notFoundFile = path.join(__dirname, 'public/404.html');
        res.sendFile(notFoundFile);
    }
});

// 删除文件中间件
const deleteFileMiddleware = (req, res, next) => {
    const filename = req.params.filename; // 获取文件名参数
    const filePath = `${uploadfolder}/${filename}`; // 替换为文件的完整路径
  
  // 检查文件是否存在
  if (fs.existsSync(filePath)) {
    // 删除指定文件
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("删除文件时发生错误", err);
        res.status(500).send("在删除文件发生了一丢丢错误",err);
      } else {
        console.log(`"${filename}" 已成功删除`);
        res.send(`文件" ${filename}"删除成功！`);
      }
    });
  } else {
    res.status(404).send("在远程服务器上的目录中未找到所指定进行操作的文件 Error 404");
  }
};
  
  // 设置/admin/delete/:filename路由并添加删除文件中间件
  app.get('/admin/delete/:filename', deleteFileMiddleware);


// 反向代理 WebSocket 后端至 /websocket
const wsport = 8084;
const websocketurl = `/websocket`;
app.use(`${websocketurl}`, createProxyMiddleware({
  target: `ws://localhost:${wsport}`, // 替换 8084 为自定义端口
  ws: true,
  logLevel: 'silent'
}));

// 启动服务
const port = 11452
app.listen({port}, '0.0.0.0', () => {
    console.log(`
    ╦ ╦╦ ╦╦═╗   ╦ ╦╔═╗╔═╗  ╦╔═╗  ╦═╗╦ ╦╔╗╔╔╗╔╦╔╗╔╔═╗         
    ║║║╠═╣╠╦╝───╠═╣╠╣ ╚═╗  ║╚═╗  ╠╦╝║ ║║║║║║║║║║║║ ╦         
    ╚╩╝╩ ╩╩╚═   ╩ ╩╚  ╚═╝  ╩╚═╝  ╩╚═╚═╝╝╚╝╝╚╝╩╝╚╝╚═╝  .  .  .
    `);
    console.log(`
    Application Online:
    -----------------------------------
    System Status: Running
    Local Port: ${port}
    Server IP: 0.0.0.0
    Storage Folder: ${uploadfolder}
    -----------------------------------
    `);
    console.log(`
    The WHR-HFS service is now running on local port ${port}.`)
    console.log(`
            [WS模块启动信息]

    |--Websocket is running at ${wsport}
    |
    |--Url path "${websocketurl}"`)
    console.log(`
    ======请求信息显示======
    `)
});