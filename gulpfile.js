/* jshint esversion: 6 */

let gulp = require('gulp'),
    gutil = require('gulp-util'),
    del = require('del'),
    fileinclude = require('gulp-file-include'),
    marked = require('marked'),
    rename = require('gulp-rename'),
    through = require('through2');

let renderer = new marked.Renderer();
let toc_list = {}, last = {}; // toc_list: toc 列表, key 为文件名

// markdown 处理, 因为 gulp 处理文件的时候好像是并行的
// 必须想办法标识每个 toc 所属的文件
function markdown() {
    return through.obj((file, enc, cb) => {
        basename = file.relative.split('.')[0];
        if (!toc_list[basename]) {
            toc_list[basename] = [];
            last[basename] = [];
        }

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
        // console.log(file);
        html = marked(file.contents.toString(), {renderer: renderer});
        file.contents = Buffer.from(html);

        return cb(null, file);
    });
}

// 生成 table of content
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
        basename = file.relative.split('.')[0];
        // console.log(basename, toc_list);
        html = '<ol>\n' + print_toc(toc_list[basename], '') + '\n</ol>';
        file.contents = Buffer.from(html);
        return cb(null, file);
    });
}

// 输出正在处理的文件名
function mylog() {
    return through.obj((file, enc, cb) => {
        gutil.log('Handing', gutil.colors.magenta(file.relative));
        return cb(null, file);
    });
}

gulp.task('clean', () => {
    return del([
        'docs/*.html',
        'docs/css/*',
        'docs/img/*',
        'docs/include/*',
        'docs/js/*',
        'docs/video'
    ]);
});

// 渲染 markdown
// 将 ./src/md/*.md 处理为 ./docs/include/*.html
// 将 导航栏 保存为 *_nav.html
// 以供 @@include
gulp.task('markdown', () => {
    return gulp.src('src/md/**/*.md')
        .pipe(mylog())
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
        .pipe(mylog())
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '.'
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

gulp.task('default', ['clean'], () => {
    gulp.start('scripts', 'images', 'styles', 'html', 'video');
});

// 监控文件变化
gulp.task('watch', () => {
    gulp.watch('./src/**/*.html', ['html']);
    gulp.watch('./src/md/*', ['html']);
    gulp.watch('./src/css/*', ['styles']);
    gulp.watch('./src/js/*', ['scripts']);
    gulp.watch('./src/img/*', ['images']);
    gulp.watch('./src/video/*', ['video']);
});
