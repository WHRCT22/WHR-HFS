document.addEventListener("DOMContentLoaded", function () {

  document.addEventListener("click", function() {
    if (!localStorage.getItem('notificationShown')) {
        setTimeout(function() {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    var notification = new Notification("WHR-HFS授权通知权限", {
                        body: "您已成功授权WHR-HFS[通知]权限",
                        icon: "favicon.ico",
                        sound: "sound/notification_sound.wav"
                    });
                    localStorage.setItem('notificationShown', 'true');
                }
            });
        }, 500);
    }
  });


  // 文件上传
  var form = document.querySelector('form[action="/WHR-HFS-API/Upload"]');
  var fileInput = document.querySelector('input[type="file"]');
  var submitButton = document.querySelector('form[action="/WHR-HFS-API/Upload"] button[type="submit"]');
  form.addEventListener("submit", function (event) {

      // 禁用发送按钮
  submitButton.disabled = true;

    // 阻止默认的表单提交行为
    event.preventDefault();


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
      refreshFileList(currentPageNumber); // 显示默认文件页码
        // 启用发送按钮
  submitButton.disabled = false;


  // 请求弹窗通知权限
  if (Notification.permission === "granted") {
    var notification = new Notification("WHR-HFS文件上传成功通知", {
      body: "您的文件已成功上传至WHR-HFS",
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
        var audio = new Audio('/sound/notification_sound.wav');
        audio.play();
      })
      .catch(error => {
        // 文件上传失败的回调
        console.error('文件上传出错！', error);
          // 在发生错误时也要确保启用发送按钮
        submitButton.disabled = false;
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


// 文件上传按钮点击事件
submitButton.addEventListener("click", function(event) {
  // 如果没有选择文件则显示错误消息并阻止默认操作
  if (fileInput.files.length === 0) {
    event.preventDefault();
    document.getElementById('error-message').innerHTML = '您必须选择一个文件来进行上传操作';
    document.getElementById('error-message').style.display = 'block';
        // 2.3秒后隐藏错误消息
        setTimeout(function() {
          document.getElementById('error-message').style.display = 'none';
        }, 2300);
    return;
  }
});

  // 当前页码
  var currentPageNumber = 1;

  // 总页数
  var totalPages = 1;

  // 刷新文件列表
  function refreshFileList(pageNumber) {
    var fileList = document.getElementById("file-list");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/WHR-HFS-API/Files-list?page=" + pageNumber, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        fileList.innerHTML = "";
        if (data.files.length === 0) {
          // 显示空列表消息
          var noResultsMessage = document.createElement("div");
          noResultsMessage.classList.add("error-message");
          noResultsMessage.innerHTML = "此页暂无文件";
          fileList.appendChild(noResultsMessage);
        } else {
          // 创建文件列表项
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


  // 渲染分页
  function renderPagination() {
    var paginationElement = document.getElementById("pagination");
    var paginationHtml = "";
    for (var i = 1; i <= totalPages; i++) {
      if (i === currentPageNumber) {
        paginationHtml +=
          '<li class="page-item active"><a class="page-link" href="#" data-page="' +
          i +
          '">' +
          i +
          "</a></li>";
      } else {
        paginationHtml +=
          '<li class="page-item"><a class="page-link" href="#" data-page="' +
          i +
          '">' +
          i +
          "</a></li>";
      }
    }
    paginationElement.innerHTML = paginationHtml;

    // 重新绑定分页按钮点击事件
    bindPageNavigation();
  }

  // 绑定分页按钮点击事件
  function bindPageNavigation() {
    var paginationElement = document.getElementById("pagination");
    var pageButtons = paginationElement.getElementsByTagName("a");

    // 移除之前绑定的点击事件
    for (var i = 0; i < pageButtons.length; i++) {
      pageButtons[i].removeEventListener("click", handlePageButtonClick);
    }

    // 重新绑定点击事件
    for (var i = 0; i < pageButtons.length; i++) {
      pageButtons[i].addEventListener("click", handlePageButtonClick);
    }
  }

  // 处理页面按钮点击事件
  function handlePageButtonClick(event) {
    event.preventDefault();
    var pageNumber = parseInt(this.getAttribute("data-page"));
    refreshFileList(pageNumber);
  }

  // 页面加载完成时，执行以下操作
  refreshFileList(currentPageNumber); // 显示第一页的文件列表
  renderPagination(); // 渲染分页
  bindPageNavigation(); // 绑定分页按钮点击事件
});