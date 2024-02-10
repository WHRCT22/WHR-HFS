console.time('程序已启动成功，启动耗时'); // 开始计时
// 模块引入
const { app, uploadfolder, fileModules } = require('./Server/ExpressModules');
const { websocketurl, websocketProxy, wsport } = require('./Server/Websocket-proxy'); 
const WebsocketModule = require('./Server/Websocket-chat-server');

// 使用filesModules导出的函数
app.use(fileModules);

// 使用websocket代理
app.use(websocketurl, websocketProxy);

// 启动服务端口
const port = 11452

// 控制台打印部分
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
 console.log(``)
  console.timeEnd('程序已启动成功，启动耗时'); // 结束计时并输出耗时
 console.log(``)
    console.log(`
    ======INFO======
    `)
});
