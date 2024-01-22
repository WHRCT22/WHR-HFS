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



var currentPageNumber = 1; // 当前页码

function refreshFileList(pageNumber) {
  var fileList = document.getElementById("file-list");
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/WHR-HFS-API/Files-list?page=" + pageNumber, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      fileList.innerHTML = '';
      if (data.files.length === 0) {
        // 如果文件列表为空，显示消息
        var noResultsMessage = document.createElement('div');
        noResultsMessage.classList.add("error-message");
        noResultsMessage.innerHTML = '此列表是空的';
        fileList.appendChild(noResultsMessage);
      } else {
        // 遍历文件列表，创建相应的链接和元素
        data.files.forEach(function (file) {
          var li = document.createElement("li");
          var a = document.createElement("a");
          var span = document.createElement("span");

          a.href = "/WHR-HFS-API/Download/" + file.name;
          a.style.display = "block";
          a.innerHTML = file.name;

          var fileSizeInMB = (file.size / (1024 * 1024)).toFixed(1);

          if (!file.isDirectory) {
            span.innerHTML = " 文件大小：" + fileSizeInMB + " MB";
          } else {
            span.innerHTML = " 文件夹";
          }
          span.style.color = "darkgray";
          span.style.fontWeight = "bold";
          
          a.addEventListener("click", function (event) {
            event.preventDefault();
            window.open(a.href, "_blank");
          });

          li.classList.add("list-group-item", "list-group-item-action");
        
          li.appendChild(a);
          li.appendChild(span);
          fileList.appendChild(li);
        });
      }

      // 更新当前页码
      currentPageNumber = pageNumber;

      // 从JSON数据中获取totalPages
      totalPages = data.totalPages;

      // 渲染分页
      renderPagination();
    }
  };
  xhr.send();
}

document.addEventListener("DOMContentLoaded", function() {
  refreshFileList(currentPageNumber); // 显示第一页的文件列表
});

function renderPagination() {
  var paginationElement = document.getElementById('pagination');
  var paginationHtml = "";
  for (var i = 1; i <= totalPages; i++) {
    // 渲染分页按钮
    if (i === currentPageNumber) {
      paginationHtml += '<li class="page-item active"><a class="page-link" href="#" data-page="' + i + '">' + i + '</a></li>';
    } else {
      paginationHtml += '<li class="page-item"><a class="page-link" href="#" data-page="' + i + '">' + i + '</a></li>';
    }
  }
  paginationElement.innerHTML = '<li class="page-item" id="previous-page"><a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>' + paginationHtml + '<li class="page-item" id="next-page"><a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';
  bindPageNavigation();
}

function bindPageNavigation() {
  var paginationElement = document.getElementById('pagination');
  var pageLinks = paginationElement.querySelectorAll('.page-link');
  pageLinks.forEach(function(link) {
    // 绑定分页按钮点击事件
    link.addEventListener('click', function(event) {
      event.preventDefault();
      var newPage = parseInt(this.getAttribute('data-page'));
      refreshFileList(newPage);
    });
  });
}

var previousPageButton = document.getElementById('previous-page');
var nextPageButton = document.getElementById('next-page');

previousPageButton.addEventListener('click', function(event) {
  event.preventDefault();
  // 点击上一页按钮事件处理
  if (currentPageNumber > 1) {
    refreshFileList(currentPageNumber - 1);
  }
});

nextPageButton.addEventListener('click', function(event) {
  event.preventDefault();
  // 点击下一页按钮事件处理
  if (currentPageNumber < totalPages) {
    refreshFileList(currentPageNumber + 1);
  }
});