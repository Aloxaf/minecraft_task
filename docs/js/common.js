
$(document).ready(function(){
    // 下拉菜单自动展开
    $('ul.nav li.dropdown').hover(function() {
        $(this).find('.dropdown-menu').stop(true, true).slideDown();
    }, function() {
        $(this).find('.dropdown-menu').stop(true, true).slideUp();
    });

});
