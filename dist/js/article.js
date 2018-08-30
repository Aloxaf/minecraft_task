
$(document).ready(() => {
    // 渲染markdown
    md = $('.content').attr('src')
    $.get(md, (e) => {
        $('.content').html(markdown.toHTML(e));
    })
})