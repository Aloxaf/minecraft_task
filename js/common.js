
$(document).ready(function(){
    // 下拉菜单自动展开
    $('ul.nav li.dropdown').hover(function() {
        $(this).find('.dropdown-menu').stop(true, true).slideDown();
    }, function() {
        $(this).find('.dropdown-menu').stop(true, true).slideUp();
    });

    // 自动播放幻灯片
    $('.flexslider').flexslider({
        animation: 'slide',   // 自动滑动
        slideshowSpeed: 3000  // 自动滑动间隔
    })
});