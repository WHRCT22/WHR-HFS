document.onreadystatechange = function() {
  if (document.readyState === 'complete') {
    var userAgent = window.navigator.userAgent;
    if (userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident') !== -1) {
      // 如果用户代理字符串中包含"MSIE"或"Trident"（表示IE浏览器），则禁止访问
      window.location.href = '/ie-blocked-page';
    }
  }
};