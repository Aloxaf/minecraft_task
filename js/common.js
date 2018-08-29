
$(document).ready(function(){
    $('ul.nav li.dropdown').hover(function() {
        $(this).find('.dropdown-menu').stop(true, true).slideDown();
    }, function() {
        $(this).find('.dropdown-menu').stop(true, true).slideUp();
    });

    $('.flexslider').flexslider({
        animation: 'slide',
        animationLoop: true,
        itemMargin: 0,
        slideshowSpeed: 4000,
        animationSpeed: 500
    })
});