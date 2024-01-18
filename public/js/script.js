//发送按钮的执行操作（空文件时按钮状态及操作等等）
document.addEventListener('DOMContentLoaded', function () {
    var fileInput = document.querySelector('input[type="file"]');
    var submitButton = document.querySelector('input[type="submit"]');

    fileInput.addEventListener('change', function () {
        if (fileInput.files.length > 0) {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    });

    var form = document.querySelector('form');
    form.addEventListener('submit', function (event) {
        if (fileInput.files.length === 0) {
            event.preventDefault(); // 阻止默认的行为
        }
    });
});

//文件列表的生成及填充
var fileList = document.getElementById('file-list');
var fileInput = document.getElementById('file-input');
var xhr = new XMLHttpRequest();
xhr.open('GET', '/WHR-HFS-API/Files-list', true);
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        data.files.forEach(function (file) {
            var li = document.createElement('li');
            var a = document.createElement('a');
            var span = document.createElement('span');

            a.href = '/WHR-HFS-API/Download/' + file.name;
            a.target = "_blank";
            a.innerHTML = file.name;

            // 转换文件大小为MB并四舍五入到小数点后两位
            var fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            // 显示文件大小
            if (!file.isDirectory) {
                span.innerHTML =   fileSizeInMB + ' MB';
            } else {
                span.innerHTML = ' 文件夹';
            }

            // 使用 Bootstrap v5 的列表组件样式来显示文件列表
            li.classList.add('list-group-item');
            li.classList.add('d-flex');
            li.classList.add('justify-content-between');
            li.appendChild(a);
            li.appendChild(span);
            fileList.appendChild(li);
        });
    }
};



        // 生成二维码及定义生成的信息和大小
        var qrcode = new QRCode(document.getElementById("qrcode"), {
            text: window.location.href,
            width: 150,
            height: 150
        });
    
xhr.send();


//Websocket文字刷新
let socket;
let connectionOpen = false;

function connectWebSocket() {
    if (!connectionOpen) {
        const currentUrl = new URL(window.location.href);
        const wsProtocol = currentUrl.protocol === 'https:' ? 'wss:' : 'ws:';
        const newUrl = `${wsProtocol}//${currentUrl.host}/websocket`;
        socket = new WebSocket(newUrl);

        const connectionTimeout = setTimeout(function () {
            if (socket.readyState !== WebSocket.OPEN) {
                console.log('服务器已离线');
                socket.close();
            }
        }, 3000);

        function updateConnectionStatus(status) {
            const statusElement = document.getElementById('status');
            statusElement.textContent = status;

            if (status === '服务器状态：在线') {
                statusElement.style.color = 'green';
            } else {
                statusElement.style.color = 'red';
            }
        }

        socket.addEventListener('open', function () {
            console.log('服务器已上线');
            connectionOpen = true;
            updateConnectionStatus('服务器状态：在线');
            clearTimeout(connectionTimeout); // 清除连接超时定时器
        });
        socket.addEventListener('close', function (event) {
            console.log('服务器已离线，正在重连');
            connectionOpen = false;
            updateConnectionStatus('服务器状态：离线');
            // 尝试重新连接
            setTimeout(function () {
                connectWebSocket(); // 再次尝试连接
            }, 500);
        });
    }
}
connectWebSocket();


 document.addEventListener("DOMContentLoaded", function() {
    fetch('https://api.ipify.org/?format=json')
  .then(response => response.json())
    .then(data => {
      const ipAddress = data.ip;
      const ipAddressElement = document.getElementById("ip-address");
      ipAddressElement.textContent = "您的IP地址: " + ipAddress;
    })
    .catch(error => {
      const errorMessage = document.getElementById("error-message");
      errorMessage.textContent = "错误：" + error.message;
    });
  });
