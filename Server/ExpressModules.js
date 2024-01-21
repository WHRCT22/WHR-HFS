// 文件操作模块，保存为 FileModule.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
        // 将fileData推送至fileList
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
  res.send(`${uploadedFiles} 上传成功！`);
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

module.exports = {
    app,
    uploadfolder,
    fileModules
};