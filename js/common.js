
$(document).ready(function(){
    $('ul.nav li.dropdown').hover(function() {
        $(this).find('.dropdown-menu').stop(true, true).slideDown();
    }, function() {
        $(this).find('.dropdown-menu').stop(true, true).slideUp();
    });
});