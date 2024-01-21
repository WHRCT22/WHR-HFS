 var OriginTitle = document.title;
  var titleTime;
   document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
                          document.title = '好瞌睡…';
                                   clearTimeout(titleTime);
                                        }
                                             else {
                                                               document.title = '呃，啊！？  - ' + 'WHR-HFS文件中心';
                                                                        titleTime = setTimeout(function () {
                                                                                     document.title = OriginTitle;
                                                                                              }, 2000);
                                                                                                   }
                                                                                                    });
                                                                                                    