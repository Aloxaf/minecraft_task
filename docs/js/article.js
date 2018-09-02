/* jshint esversion: 6 */

$(document).ready(function() {
    baseurl = location.pathname;
    $(".sidebar a").each((ind, ele) => {
        ele.setAttribute('href', baseurl + ele.getAttribute("href"));
    });
});
