document.addEventListener("DOMContentLoaded", function () {

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
    document.getElementById('error-message').innerHTML = '请选择一个文件来进行上传操作';
    document.getElementById('error-message').style.display = 'block';
        // 2.3秒后隐藏错误消息
        setTimeout(function() {
          document.getElementById('error-message').style.display = 'none';
        }, 3000);
    return;
  }
});

  // 当前页码
  var currentPageNumber = 1; //默认的显示的当前页数

  // 总页数
  var totalPages = 1; //默认的总共页数，将在后续获取JSON时动态更新

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
        data.files.forEach(function (file) {
          var li = document.createElement("li");
          var a = document.createElement("a");
          var span = document.createElement("span");
          var p = document.createElement("p");

          a.href = "/WHR-HFS-API/Download/" + file.name;
          a.style.display = "block";
          a.innerHTML = file.name;


          if (file.isDirectory === "1") {
            span.innerHTML = " 文件夹";
          } else {
if (file.size < 1024) {
  // 小于1KB，显示为B
  span.innerHTML = " 文件大小: " + file.size + " B";
} else if (file.size < 1024 * 1024) {
  // 大于等于1KB且小于1MB，显示为KB
  var fileSizeInKB = (file.size / 1024).toFixed(1);
  span.innerHTML = " 文件大小: " + fileSizeInKB + " KB";
} else {
  // 大于等于1MB，显示为MB
  var fileSizeInMB = (file.size / (1024 * 1024)).toFixed(1);
  span.innerHTML = " 文件大小: " + fileSizeInMB + " MB";
}

            // 获取上传时间信息
            // var uploadTime = new Date(file.uploadTime).toLocaleString(); // 替换为实际的上传时间字段名

            // 在段落元素中显示上传时间
            // p.innerHTML = "上传时间: " + uploadTime;
            // p.classList.add("text-secondary", "middle"); // 注：这里使用了 Bootstrap 5 的类

            // 将文件名称、文件大小、上传者以及上传时间添加到文件列表中
            li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
            li.appendChild(a);
            li.appendChild(span);
            // li.appendChild(p);
            fileList.appendChild(li);
          }
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
      logoutButton.textContent = '登出';
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
    uploadButton.textContent = '🙂请登录后再进行上传';
  }
});


// 后台程序启动时间
// function formatRuntime(milliseconds) {
//   const timeInSeconds = Math.floor(milliseconds / 1000);
//   if (timeInSeconds < 60) {
//     return `${timeInSeconds} 秒`;
//   } else {
//     const timeInMinutes = Math.floor(timeInSeconds / 60);
//     if (timeInMinutes < 60) {
//       const remainingSeconds = timeInSeconds % 60;
//       return `${timeInMinutes} 分钟 ${remainingSeconds} 秒`;
//     } else {
//       const timeInHours = Math.floor(timeInMinutes / 60);
//       const remainingMinutes = timeInMinutes % 60;
//       if (timeInHours < 24) {
//         return `${timeInHours} 小时 ${remainingMinutes} 分钟`;
//       } else {
//         const timeInDays = Math.floor(timeInHours / 24);
//         const remainingHours = timeInHours % 24;
//         if (timeInDays < 365) {
//           return `${timeInDays} 天 ${remainingHours} 小时`;
//         } else {
//           const timeInYears = Math.floor(timeInDays / 365);
//           const remainingDays = timeInDays % 365;
//           return `${timeInYears} 年 ${remainingDays} 天`;
//         }
//       }
//     }
//   }
// }

// function updateRuntime() {
//   fetch('/runtime')
//     .then(response => {
//       if (!response.ok) {
//         throw new Error('请求失败');
//       }
//       return response.json();
//     })
//     .then(data => {
//       const runtimeElement = document.getElementById('runtime');
//       runtimeElement.textContent = `WHR-HFS后端已运行：${formatRuntime(data.runtime)}`;
//       runtimeElement.style.color = 'black';
//     })
//     .catch(error => {
//       console.error('请求失败:', error);
//       const runtimeElement = document.getElementById('runtime');
//       runtimeElement.textContent = `服务器无法响应，错误信息：${error.message}`;
//       runtimeElement.style.color = 'red';
//     });
// }

// 初次加载页面时先请求一次，之后每隔1秒重新请求并替换显示的数据
// updateRuntime();
// setInterval(updateRuntime, 1000);  // 每1秒执行一次updateRuntime函数
