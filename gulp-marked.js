/* jshint esversion: 6 */

let marked = require('marked'),
    hash = require('hash.js'),
    highlightjs = require('highlight.js');

let renderer = new marked.Renderer();
let toc_list = {}, last = {}; // toc_list: toc 列表, key 为文件名


// markdown 处理, 因为 gulp 处理文件的时候好像是并行的
// 必须想办法标识每个 toc 所属的文件
function markdown(md) {
    let basename = hash.sha256().update(md).digest('hex'); // 取文件的 hash 作为标识

    toc_list[basename] = [];
    last[basename] = [];

    // 自定义 renderer 以适配 toc
    renderer.heading = (text, level) => {
        let slug = encodeURIComponent(text.toLowerCase());
        let headline = {
            level: level,
            slug: slug,
            title: text
        };
        
        if (last[basename][level - 1]) {
            if (last[basename][level - 1].children === undefined) 
                last[basename][level - 1].children = [];
            last[basename][level - 1].children.push(headline);
        } else {
            toc_list[basename].push(headline);
        }
        last[basename][level] = headline;
        
        return `<h${level} id="${slug}"><a href="#${slug}" class="anchor"></a>${text}</h${level}>`;
    };

    // https://shuheikagawa.com/blog/2015/09/21/using-highlight-js-with-marked/
    renderer.code = (code, language) => {
        const validLang = !!(language && highlightjs.getLanguage(language));
        // Highlight only if the language is valid.
        const highlighted = validLang ? highlightjs.highlight(language, code).value : code;
        // Render the highlighted code with `hljs` class.
        return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;      
    };

    // console.log(file);
    return marked(md, {renderer: renderer});
}

// 生成 table of content
function sidebar(md) {
    let basename = hash.sha256().update(md).digest('hex');

    if (!toc_list[basename])
        markdown(md);

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