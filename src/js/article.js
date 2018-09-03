/* jshint esversion: 6 */

$(document).ready(function() {
    baseurl = location.pathname;
    $('.sidebar a').each((ind, ele) => {
        ele.setAttribute('href', baseurl + ele.getAttribute('href'));
    });

    $(".content img").each((ind, ele) => {
        alt = ele.getAttribute('alt');
        rowspan = ele.getAttribute('rowspan');
        if (alt && alt.indexOf('>') == 0) {
            ele.outerHTML = `<div align="right">${ele.outerHTML}</div>`;
        }
        if (rowspan) {
            ele.parentElement.setAttribute('rowspan', rowspan);
        }
    });

    $('td').filter((ind, ele) => ele.innerText == '--').remove();
});
