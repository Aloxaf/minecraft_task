/* jshint esversion: 6 */

let Remarkable =  require('remarkable'),
    hash = require('hash.js'),
    hljs = require('highlight.js');

let md = new Remarkable({
    html: true,
    linkify: true,
    highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang))
            return hljs.highlight(lang, str).value;
        return hljs.highlightAuto(str).value;
    }
});

let toc_list = {}, last = {}; // toc_list: toc 列表, key 为文件内容 hash

// markdown 处理, 因为 gulp 处理文件的时候好像是并行的
// 必须想办法标识每个 toc 所属的文件
function markdown(str) {
    let basename = hash.sha256().update(str).digest('hex'); // 取文件的 hash 作为标识

    toc_list[basename] = [];
    last[basename] = [];

    // 自定义 renderer 以适配 toc
    md.renderer.rules.heading_open = (token, index) => {
        let level = token[index];
        let label = token[index + 1];
        let slug = encodeURIComponent(label.content);
        let headline = {
            level: level,
            slug: slug,
            title: label.content
        };

        if (last[basename][level - 1]) {
            if (last[basename][level - 1].children === undefined) 
                last[basename][level - 1].children = [];
            last[basename][level - 1].children.push(headline);
        } else {
            toc_list[basename].push(headline);
        }
        last[basename][level] = headline;

        return `<h${level.hLevel} id="${slug}"><a href="#${slug}" class="anchor"></a>`;
    };

    return md.render(str);
}

// 生成 table of content
function sidebar(str) {
    let basename = hash.sha256().update(str).digest('hex');

    if (!toc_list[basename])
        markdown(str);

    let index = [0];

    function tree_to_html(l, html) {
        for (let i of l) {
            index[index.length - 1] += 1;
            html += `<li><a href="#${i.slug}">${index.join('.')}. ${i.title}</a></li>`;
            if (i.children) {
                index.push(0);
                html += '<ul>\n' + tree_to_html(i.children, '') + '\n</ul>';
                index.pop();
            }
        }
        return html;
    }

    return  '<ul>\n' + tree_to_html(toc_list[basename], '') + '\n</ul>';
}

module.exports.markdown = markdown;
module.exports.sidebar = sidebar;