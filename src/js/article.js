/* jshint esversion: 6 */

$(document).ready(function() {
    baseurl = location.pathname;
    $('.sidebar a').each((ind, ele) => {
        ele.setAttribute('href', baseurl + ele.getAttribute('href'));
    });

    $(".content img").each((ind, ele) => {
        if (ele.getAttribute('alt').indexOf('>') == 0) {
            ele.outerHTML = `<div align="right">${ele.outerHTML}</div>`;
        }
    });
});
