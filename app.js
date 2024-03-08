const ini = require('ini');//引入需要的模块
const fs = require('fs');//引入需要的模块

// 自定义动态模块引入
const { app, uploadfolder, fileModules } = require('./Server/ExpressModules');
const { websocketurl, websocketProxy, wsport } = require('./Server/Websocket-proxy'); 
const WebsocketModule = require('./Server/Websocket-chat-server');

console.time('程序已启动成功，启动耗时'); // 开始计时


// 读取config.ini文件中的端口信息
function readConfig() {
  const configPath = 'Config.ini';
  if (!fs.existsSync(configPath)) {
    // 如果config.ini文件不存在，就创建一个默认的config.ini文件并写入默认端口信息
    try {
      const defaultConfig = {
        SeverPort: 80, // 默认端口号
      };
      fs.writeFileSync(configPath, ini.stringify(defaultConfig));
      return defaultConfig.SeverPort;
    } catch (error) {
      console.error('Error creating config.ini file:', error.message);
      return null;
    }
  } else {
    // 如果config.ini文件存在，就读取其中的端口信息
    try {
      const config = ini.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.SeverPort) {
        return config.SeverPort;
      } else {
        throw new Error('未在配置文件中找到指定的端口配置，将采用默认端口11452端口启动');
      }
    } catch (error) {
      console.error('在读取配置文件时发生错误：', error.message);
      return null;
    }
  }
}

// 使用filesModules导出的函数
app.use(fileModules);

// 使用websocket代理
app.use(websocketurl, websocketProxy);

// 获取端口信息
const port = readConfig() || 11452; // 如果config.ini中没有端口信息，则默认使用11452

// 控制台打印部分
app.listen({port}, '0.0.0.0', () => {
    console.log(`
    ╦ ╦╦ ╦╦═╗   ╦ ╦╔═╗╔═╗  ╦╔═╗  ╦═╗╦ ╦╔╗╔╔╗╔╦╔╗╔╔═╗         
    ║║║╠═╣╠╦╝───╠═╣╠╣ ╚═╗  ║╚═╗  ╠╦╝║ ║║║║║║║║║║║║ ╦         
    ╚╩╝╩ ╩╩╚═   ╩ ╩╚  ╚═╝  ╩╚═╝  ╩╚═╚═╝╝╚╝╝╚╝╩╝╚╝╚═╝  .  .  .
    `);
    console.log(`
    -----------------------------------
    Local Port: ${port}
    Server IP: 0.0.0.0
    Storage Folder: ${uploadfolder}
    -----------------------------------
    `);
    console.log(`
        注意：你可以在程序目录下自动生成的Config.ini文件中更改一定设置.`)
 console.log(``)
});
