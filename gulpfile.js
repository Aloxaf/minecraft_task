let gulp = require('gulp'),
    cache = require('gulp-cache'),
    del = require('del'),
    fileinclude = require('gulp-file-include')
    imagemin = require('gulp-imagemin'),
    jshint = require('gulp-jshint'),
    markdown = require('gulp-markdown'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename');

gulp.task('clean', (cb) => {
    del(['dist/*'], cb);
});

// 渲染 markdown
// 将 ./src/md/*.md 处理为 ./dist/include/*.html
// 以供 @@include
gulp.task('markdown', () => {
    return gulp.src('src/md/**/*')
        .pipe(markdown())
        .pipe(rename( opt => {
            opt.extname = '.html';
            return opt;
        }))
        .pipe(gulp.dest('dist/include'))
        .pipe(notify({
            message: 'Markdown task complete'
        }));
});

// 处理 html 的 @@include
gulp.task('html', ['markdown'], () => {
    return gulp.src('src/**/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('dist'))
        .pipe(notify({
            message: 'Html task complete'
        }));
});

// 压缩图片
gulp.task('images', () => {
    return gulp.src('src/img/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/img'))
        .pipe(notify({
            message: 'Image task complete'
        }));
});

// 检查js
gulp.task('scripts', () => {
    return gulp.src('src/js/**/*')
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('dist/js'))
        .pipe(notify({
            message: 'Scripts task complete'
        }));
});

// css, 啥都没做
gulp.task('styles', () => {
    return gulp.src('src/css/**/*')
        .pipe(gulp.dest('dist/css'))
        .pipe(notify({
            message: 'Styles task complete'
        }));
});

gulp.task('default', () => {
    gulp.start('clean', 'scripts', 'images', 'styles', 'html');
});
