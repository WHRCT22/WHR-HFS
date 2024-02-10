// 文件操作模块，保存为 FileModule.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

//定义上传文件目录
const uploadfolder= 'Uploads'

const uploadPath = path.join(process.cwd(), `${uploadfolder}`);

// 初始 Express 应用
const app = express();
const fileModules = express();
// console.log('');

// 设置静态资源Base路径
app.use(express.static(path.join(__dirname, 'public')));

// 获取文件列表路由
app.get('/WHR-HFS-API/Files-list', (req, res) => {
  const pageNumber = parseInt(req.query.page) || 1;
  const pageSize = 10;
  const uploadPath = path.join(process.cwd(), `${uploadfolder}`);
  const files = fs.readdirSync(uploadPath);
  const totalFiles = files.length;
  const totalPages = Math.ceil(totalFiles / pageSize);

  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = pageNumber * pageSize;
  const fileList = [];

  files.slice(startIndex, endIndex).forEach((file) => {
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
      files: fileList,
      totalPages: totalPages // 将 totalPages 作为局部变量返回给前端
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
//登录页面
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});
//注册页面
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/register.html'));
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
    // 解决中文名乱码的问题 使用latin1编码格式
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

  //获取上传成功的文件名
  const uploadedFiles = req.files.map(file => `${file.originalname}`).join(', ');
  //返回文件名+上传成功的信息
  res.send(`您的文件 "${uploadedFiles}" 已成功上传至WHR-HFS`);
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



app.use(express.json());



// 数据库文件
const dbFile = 'userdata.db';

// 创建数据库连接并打开，并记录耗时

let db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('\x1b[31m%s\x1b[0m', err.message); // 红色
  } else {
    console.log('\x1b[32m%s\x1b[0m', '已连接至Sqlite3本地用户数据库'); // 绿色
  }
});

// 创建 users 表
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  // 控制台打印要注册的用户名和密码
  console.log(`接收到用户注册请求 - 申请的用户名: ${username}, 密码: ${password}`);
  
  // 首先检查数据库中是否存在相同的用户名
  db.get('SELECT username FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('未知错误');
      return;
    }
    if (row) {
      console.log(`Registration failed - Username: ${username} already exists.`);
      res.status(409).send('HTTPCODE:409   错误信息：在表中已有相同的用户名存在'); 
    } else {
      // 添加对密码的复杂性和长度的检查
      if (password.length < 8 || !/\d/.test(password)) {
        res.status(400).send('密码必须至少包含8个字符并且包含至少一个数字');
        return;
      }

      // 插入新用户
      db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function (err) {
        if (err) {
          console.error(err.message);
          res.status(500).send('在向表写入数据时发生错误');
          return;
        }
        res.send(`您已注册成功！用户名" ${username}"密码 "${password}"，请妥善保管此信息，请勿泄露此信息`);
      });
    }
  });
});

// 处理用户登录请求
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (row) {
      console.log(`用户${username}已登录`); // 记录用户登录信息
      
      res.send(`WHR-HFS用户${username}，欢迎回来！`); // 发送欢迎消息及用户名
    } else {
      res.status(401).send('HTTPCODE:401  错误信息：不存在的用户名');
    }
  });
});
module.exports = {
    app,
    uploadfolder,
    fileModules
};