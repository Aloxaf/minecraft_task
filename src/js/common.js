
$(document).ready(function(){
    // 加载导航栏
    active_li = $('nav').attr('active');
    $('nav').load('nav.html', () => {
        // 设定当前激活页面
        $(`#${active_li}`).addClass('active');

        // 下拉菜单自动展开
        $('ul.nav li.dropdown').hover(function() {
            $(this).find('.dropdown-menu').stop(true, true).slideDown();
        }, function() {
            $(this).find('.dropdown-menu').stop(true, true).slideUp();
        });
    });

});