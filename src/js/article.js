/* jshint esversion: 6 */

$(document).ready(function () {

    // 修正侧边栏链接
    let baseurl = location.pathname;
    $('#sidebar a').each((ind, ele) => {
        ele.setAttribute('href', baseurl + ele.getAttribute('href'));
    });

    // 调整图片位置
    $(".content img").each((ind, ele) => {
        alt = ele.getAttribute('alt');
        rowspan = ele.getAttribute('rowspan');
        if (alt && alt.indexOf('>') == 0) {
            ele.outerHTML = `<div align="right">${ele.outerHTML}</div>`;
        }
    });

    // 合并单元格
    $('table').each((ind, table) => {
        let col = $('thead>tr>th', table).length;
        let row = $('tbody>tr', table).length;

        $('tbody>tr', table).each((ind, tr) => {
            let td = $('td:last', tr);
            if (td.children('img').length > 0) {
                td.attr('rowspan', row);
            } else if (td.text() == '--' || td.text() == '') {
                td.remove();
            }
        });
    });
});



