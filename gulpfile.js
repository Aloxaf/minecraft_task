/* jshint esversion: 6 */

let gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserSync = require('browser-sync').create(),
    del = require('del'),
    fileinclude = require('gulp-file-include'),
    hash = require('hash.js'),
    highlightjs = require('highlight.js'),
    marked = require('marked'),
    through = require('through2');

let renderer = new marked.Renderer();
let toc_list = {}, last = {}; // toc_list: toc 列表, key 为文件名


// markdown 处理, 因为 gulp 处理文件的时候好像是并行的
// 必须想办法标识每个 toc 所属的文件
function markdown(md) {
    basename = hash.sha256().update(md).digest('hex'); // 取文件的 hash 作为标识
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
    basename = hash.sha256().update(md).digest('hex');

    function tree_to_html(l, html) {
        for (let i of l) {
            html += `<li><a href="#${i.slug}">${i.title}</a></li>`;
            if (i.children) 
                html += '<ol>\n' + tree_to_html(i.children, '') + '\n</ol>';
        }
        return html;
    }

    return  '<ol>\n' + tree_to_html(toc_list[basename], '') + '\n</ol>';
}

// 输出正在处理的文件名
function mylog() {
    return through.obj((file, enc, cb) => {
        gutil.log('Handing', gutil.colors.magenta(file.relative));
        return cb(null, file);
    });
}

gulp.task('clean', () => {
    return del(['docs/**/*', '!docs/CNAME']);
});

// 处理 html 的 @@include
gulp.task('html', () => {
    return gulp.src(['src/**/*.html', '!src/include/*.html'])
        .pipe(mylog())
        .pipe(fileinclude({
            prefix: '@@',
            basepath: 'src',
            filters: {
                sidebar: sidebar,
                markdown: markdown
            }
        }))
        .pipe(gulp.dest('docs'));
});

// 图片, 啥都没做
gulp.task('images', () => {
    return gulp.src('src/img/**/*')
        .pipe(mylog())
        .pipe(gulp.dest('docs/img'));
});

// js, 啥都没做
gulp.task('scripts', () => {
    return gulp.src('src/js/**/*')
        .pipe(mylog())
        .pipe(gulp.dest('docs/js'));
});

// css, 啥都没做
gulp.task('styles', () => {
    return gulp.src('src/css/**/*')
        .pipe(mylog())
        .pipe(gulp.dest('docs/css'));
});

gulp.task('video', () => {
    return gulp.src('src/video/**/*')
        .pipe(mylog())
        .pipe(gulp.dest('docs/video'));
});

gulp.task('all', ['clean'], () => {
    gulp.start('scripts', 'images', 'styles', 'html', 'video');
});

gulp.task('default', ['clean'], () => {
    browserSync.init({
        server: {
            baseDir: './docs'
        }
    });
    gulp.start('scripts', 'images', 'styles', 'html', 'video');
    gulp.watch('./src/**/*.html', ['html']).on('change', browserSync.reload);
    gulp.watch('./src/md/**/*.md', ['html']).on('change', browserSync.reload);
    gulp.watch('./src/css/*.css', ['styles']).on('change', browserSync.reload);
    gulp.watch('./src/js/*.js', ['scripts']).on('change', browserSync.reload);
    gulp.watch('./src/img/*', ['images']).on('change', browserSync.reload);
    gulp.watch('./src/video/*', ['video']).on('change', browserSync.reload);
});
