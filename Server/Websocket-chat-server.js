// 在服务器端定义一个数组来保存历史消息
const messageHistory = [];

//自定义启动的WS服务器端口
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8084 });
// console.log('');
//定义有WS客户端连接时的操作
wss.on('connection', function connection(ws, req) {
    //获取用户远程IP地址
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // 首先发送一条包含“你在线了”的JSON信息给新连接的客户端
    ws.send(JSON.stringify("欢迎加入聊天室！"));

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
// 导出模块
module.exports = {
    messageHistory, // 导出messageHistory数组
    wss, // 导出WebSocket Server实例，以便在其他文件中访问
};