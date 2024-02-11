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

   // 获取当前用户名
   const username = localStorage.getItem('username');

    var formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('username', username); // 添加用户名数据

    fetch('/WHR-HFS-API/Upload', {
      method: 'POST',
      body: formData
    })
        .then(response => response.text())
        .then(data => {

      // 移除文件名 + 正在上传...的文本
      fileUploadStatus.innerHTML = '';
      refreshFileList(currentPageNumber); // 显示默认文件页码
        fileInput.value = '';

        var audio = new Audio('/sound/notification_sound.wav');
        audio.play();

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



var qrcode = new QRCode(document.getElementById("qrcode"), {
  text: window.location.href,
  width: 150,
  height: 150,
  correctLevel: QRCode.CorrectLevel.H, // 设置纠错级别为 H（最高级别）
  useSVG: true // 启用 SVG 生成
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

document.addEventListener('keydown', function(event) {
  if (event.key === 'h' || event.key === 'H') {
    var sidebar = document.getElementById('sidebar');
    var sidebarStyle = window.getComputedStyle(sidebar);
    if (sidebarStyle.right === '0px' || sidebarStyle.right === '0') {
      sidebar.style.right = '-260px';
    } else {
      sidebar.style.right = '0';
    }
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const username = localStorage.getItem('username');
  const loginRegisterButtons = document.querySelector('.btn-group[aria-label="Login and Register"]');
  const greeting = document.createElement('div');
  greeting.classList.add('greeting'); // 添加一个类名用于后续操作
  let logoutButton; // 存储退出登录按钮的引用

  if (username) {
    // 如果 localStorage 中存在用户名
    loginRegisterButtons.style.display = 'none'; // 隐藏注册和登录按钮
    greeting.innerHTML = `欢迎回来，${username}！`;

    // 向用户显示欢迎信息
    loginRegisterButtons.parentNode.insertBefore(greeting, loginRegisterButtons.nextSibling);
  } else {
    // 如果 localStorage 中不存在用户名
    loginRegisterButtons.style.display = 'flex'; // 显示注册和登录按钮
  }

  // 添加事件监听器，仅在不存在退出按钮时添加
  greeting.addEventListener('mouseover', function() {
    if (!logoutButton) {
      logoutButton = document.createElement('button');
      logoutButton.textContent = '退出登录';
      logoutButton.classList.add('btn', 'btn-outline-danger', 'btn-sm'); // 添加Bootstrap v5 的样式类
      logoutButton.addEventListener('click', function() {
        // 用户单击退出登录按钮后的操作
        localStorage.removeItem('username'); // 清除用户名
        window.location.reload(); // 刷新页面
      });
      greeting.appendChild(logoutButton); // 将退出登录按钮添加到欢迎信息中
    }
  });

  // 添加mouseout事件监听器，隐藏退出按钮
  greeting.addEventListener('mouseout', function(event) {
    if (event.relatedTarget !== logoutButton) {
      greeting.removeChild(logoutButton); // 移除退出登录按钮
      logoutButton = null; // 重置退出按钮引用
    }
  });
});
document.addEventListener('DOMContentLoaded', function() {
  // 检查本地存储中是否有用户名
  const username = localStorage.getItem('username');

  if (!username) {
    // 如果本地存储中没有用户名，则禁止上传文件
    const fileInput = document.getElementById('filesinputupload');
    fileInput.disabled = true;

    // 改变上传文件按钮的文字
    const uploadButton = document.querySelector('button[type="submit"]');
    uploadButton.textContent = '请登录后上传';
  }
});