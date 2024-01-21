document.addEventListener("DOMContentLoaded", function () {

  document.addEventListener("click", function() {
    if (!localStorage.getItem('notificationShown')) {
        setTimeout(function() {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    var notification = new Notification("WHR-HFS授权通知权限", {
                        body: "您已成功授权[通知]权限",
                        icon: "favicon.ico",
                        sound: "sound/notification_sound.wav"
                    });
                    localStorage.setItem('notificationShown', 'true');
                }
            });
        }, 500);
    }
});

  var fileInput = document.querySelector('input[type="file"]');
  var submitButton = document.querySelector('button[type="submit"]');

  fileInput.addEventListener("change", function () {
    if (fileInput.files.length > 0) {
      submitButton.disabled = false;
    } else {
      submitButton.disabled = true;
    }
  });

  var form = document.querySelector('form[action="/WHR-HFS-API/Upload"]');
  form.addEventListener("submit", function (event) {
    if (fileInput.files.length === 0) {
      event.preventDefault(); // 阻止默认的行为
    }
  });
});


//文件列表刷新
function refreshFileList() {
var fileList = document.getElementById("file-list");
var xhr = new XMLHttpRequest();
xhr.open("GET", "/WHR-HFS-API/Files-list", true);
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4 && xhr.status === 200) {
    var data = JSON.parse(xhr.responseText);
    fileList.innerHTML = ''; // 清空
    data.files.forEach(function (file) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      var span = document.createElement("span");

      a.href = "#" + file.name;
      a.style.display = "block";
      a.innerHTML = file.name;

      // 转换文件大小为MB并四舍五入到小数点后两位
      var fileSizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      // 显示文件大小
      if (!file.isDirectory) {
        span.innerHTML = " 文件大小：" + fileSizeInMB + " MB";
      } else {
        span.innerHTML = " 文件夹";
      }
      span.style.color = "darkgray";
      span.style.fontWeight = "bold";
      // 添加点击事件
      li.addEventListener("click", function () {
        var downloadUrl = "/WHR-HFS-API/Download/" + file.name;
        window.open(downloadUrl, "_blank");
      });

      // 使用 Bootstrap v5 的列表组件样式来显示文件列表
      li.classList.add("list-group-item", "list-group-item-action");

      li.appendChild(a);
      li.appendChild(span);
      fileList.appendChild(li);
    });
  }
};
xhr.send();
}
refreshFileList();

// 文件上传
var form = document.querySelector('form[action="/WHR-HFS-API/Upload"]');
var fileInput = document.querySelector('input[type="file"]');
var submitButton = document.querySelector('form[action="/WHR-HFS-API/Upload"] button[type="submit"]');
form.addEventListener("submit", function (event) {

  // 阻止默认的表单提交行为
  event.preventDefault();

  // 禁用提交按钮
  submitButton.disabled = true;

  var fileUploadStatus = document.getElementById('fileUploadStatus');
  fileUploadStatus.innerHTML = `${fileInput.files[0].name} 正在上传...`;

  var formData = new FormData();
  formData.append('file', fileInput.files[0]);

  fetch('/WHR-HFS-API/Upload', {
    method: 'POST',
    body: formData
  })
      .then(response => response.text())
      .then(data => {

    // 移除文件名 + 正在上传...的文本
    fileUploadStatus.innerHTML = '';


  // 文件上传成功，调用获取文件列表的函数刷新文件列表
  refreshFileList();

// 请求弹窗通知权限
if (Notification.permission === "granted") {
  var notification = new Notification("WHR-HFS文件上传成功通知", {
    body: "您的文件已成功上传",
    icon: "favicon.ico", // 修改为相应的图片文件路径
    sound: "sound/notification_sound.wav"  // 替换为您希望使用的提示音文件路径
  });
}

    // 创建模态框元素
    var modal = document.createElement("div");
    modal.classList.add("modal", "fade"); // Bootstrap v5样式类
    modal.setAttribute("tabindex", "-1");
    modal.setAttribute("aria-labelledby", "modalTitle");
    modal.setAttribute("aria-hidden", "true");

    // 创建模态框对话框
    var modalDialog = document.createElement("div");
    modalDialog.classList.add("modal-dialog");
    modal.appendChild(modalDialog);

    // 创建模态框内容
    var modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");
    modalDialog.appendChild(modalContent);

    // 创建模态框头部
    var modalHeader = document.createElement("div");
    modalHeader.classList.add("modal-header");
    modalHeader.innerHTML = 
      '<h5 class="modal-title">WHR-HFS文件上传信息</h5>' +
      '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
    modalContent.appendChild(modalHeader);

    // 创建模态框主体
    var modalBody = document.createElement("div");
    modalBody.classList.add("modal-body");
    modalBody.innerHTML = data; // 显示服务器返回的消息
    modalContent.appendChild(modalBody);

    // 创建模态框底部
    var modalFooter = document.createElement("div");
    modalFooter.classList.add("modal-footer");
    modalFooter.innerHTML = 
      '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="background-color: #0d6efd;">关闭</button>';
    modalContent.appendChild(modalFooter);

    // 插入模态框
    document.body.appendChild(modal);

    // 显示模态框
    var modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  

      // 清除选择的文件
      fileInput.value = '';

      // 启用提交按钮
      submitButton.disabled = false;
    })
    .catch(error => {
      // 文件上传失败的回调
      console.error('文件上传出错！', error);
      // 处理失败的情况
    })
    .finally(() => {
      // 启用提交按钮
      submitButton.disabled = false;
    });
  });



// 生成二维码及定义生成的信息和大小
var qrcode = new QRCode(document.getElementById("qrcode"), {
  text: window.location.href,
  width: 150,
  height: 150,
});

document.querySelector(".form-control").addEventListener("input", function () {
  var input, ul, li, a, i, txtValue, resultsFound;
  input = this.value.toLowerCase();
  ul = document.getElementById("file-list");
  li = ul.getElementsByTagName("li");
  resultsFound = false;

  for (i = 0; i < li.length; i++) {
    a = li[i].innerText.toLowerCase();
    if (a.indexOf(input) > -1) {
      li[i].style.display = "";
      resultsFound = true;
    } else {
      li[i].style.display = "none";
    }
  }

  // 根据搜索结果状态来显示或隐藏提示信息
  var noResultsElement = document.getElementById("no-results");
  if (resultsFound) {
    noResultsElement.style.display = "none";
  } else {
    noResultsElement.style.display = "block";
  }
});