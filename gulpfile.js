let gulp = require('gulp'),
    del = require('del'),
    fileinclude = require('gulp-file-include'),
    lec = require('gulp-line-ending-corrector'),
    markdown = require('gulp-markdown'),
    rename = require('gulp-rename');

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
// 以供 @@include
gulp.task('markdown', () => {
    return gulp.src('src/md/**/*')
        .pipe(markdown())
        .pipe(rename( opt => {
            opt.extname = '.html';
            return opt;
        }))
        .pipe(lec())
        .pipe(gulp.dest('docs/include'));
});

// 处理 html 的 @@include
gulp.task('html', ['markdown'], () => {
    return gulp.src('src/**/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(lec())
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
        .pipe(lec())
        .pipe(gulp.dest('docs/js'));
});

// css, 啥都没做
gulp.task('styles', () => {
    return gulp.src('src/css/**/*')
        .pipe(lec())
        .pipe(gulp.dest('docs/css'));
});

gulp.task('default', ['clean'], () => {
    gulp.start('scripts', 'images', 'styles', 'html');
});

// 监控文件变化
gulp.task('watch', () => {
    gulp.watch('./src/**/*.html', ['html']);
    gulp.watch('./src/md/**/*', ['html']);
    gulp.watch('./src/css/**/*', ['styles']);
    gulp.watch('./src/js/**/*', ['scripts']);
    gulp.watch('./src/img/**/*', ['images']);
})