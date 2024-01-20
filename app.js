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
