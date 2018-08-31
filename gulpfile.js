/* jshint esversion: 6 */

let gulp = require('gulp'),
    del = require('del'),
    fileinclude = require('gulp-file-include'),
    markdown = require('gulp-markdown'),
    rename = require('gulp-rename'),
    through = require('through2');

let renderer = new markdown.marked.Renderer();
let toc_list = [], last = {};

// 自定义 heading 的 renderer, 与 toc 适配
renderer.heading = (text, level) => {
    let slug = encodeURIComponent(text.toLowerCase());
    let headline = {
        level: level,
        slug: slug,
        title: text
    };
    
    if (last[level - 1]) {
        if (last[level - 1].children === undefined) 
            last[level - 1].children = [];
        last[level - 1].children.push(headline);
    } else {
        toc_list.push(headline);
    }
    last[level] = headline;
    
    return `<h${level} id="${slug}"><a href="#${slug}" class="anchor"></a>${text}</h${level}>`;
};

// 生成 table of content
// md 只能有一个一级标题
function toc() {
    function print_toc(l, html) {
        for (let i of l) {
            html += `<li><a href="#${i.slug}">${i.title}</a></li>`;
            if (i.children) 
                html += '<ol>\n' + print_toc(i.children, '') + '\n</ol>';
        }
        return html;
    }

    return through.obj((file, enc, cb) => {
        html = '<ol>\n' + print_toc([toc_list.shift()], '') + '\n</ol>';
        file.contents = Buffer.from(html);
        return cb(null, file);
    });
}

gulp.task('clean', () => {
    return del([
        'docs/*.html',
        'docs/css/*',
        'docs/img/*',
        'docs/include/*',
        'docs/js/*'
    ]);
});

// 渲染 markdown
// 将 ./src/md/*.md 处理为 ./docs/include/*.html
// 将 导航栏 保存为 *_nav.html
// 以供 @@include
gulp.task('markdown', () => {
    return gulp.src('src/md/**/*')
        .pipe(markdown({
            renderer: renderer
        }))
        .pipe(rename( opt => {
            opt.extname = '.html';
            return opt;
        }))
        .pipe(gulp.dest('docs/include'))
        .pipe(toc())
        .pipe(rename( opt => {
            opt.basename += '_nav';
            return opt;
        }))
        .pipe(gulp.dest('docs/include'));
});

// 处理 html 的 @@include
gulp.task('html', ['markdown'], () => {
    return gulp.src('src/**/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('docs'));
});

// 图片, 啥都没做
gulp.task('images', () => {
    return gulp.src('src/img/**/*')
        .pipe(gulp.dest('docs/img'));
});

// js, 啥都没做
gulp.task('scripts', () => {
    return gulp.src('src/js/**/*')
        .pipe(gulp.dest('docs/js'));
});

// css, 啥都没做
gulp.task('styles', () => {
    return gulp.src('src/css/**/*')
        .pipe(gulp.dest('docs/css'));
});

gulp.task('default', ['clean'], () => {
    gulp.start('scripts', 'images', 'styles', 'html');
});

// 监控文件变化
gulp.task('watch', () => {
    gulp.watch('./src/**/*.html', ['html']);
    gulp.watch('./src/md/*', ['html']);
    gulp.watch('./src/css/*', ['styles']);
    gulp.watch('./src/js/*', ['scripts']);
    gulp.watch('./src/img/*', ['images']);
});
