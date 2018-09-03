/* jshint esversion: 6 */

let gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserSync = require('browser-sync').create(),
    del = require('del'),
    fileinclude = require('gulp-file-include'),
    markdown = require('./gulp-showdown'),
    sass = require('gulp-sass'),
    through = require('through2');


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
                sidebar: markdown.sidebar,
                markdown: markdown.markdown
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

// 样式文件
gulp.task('styles', () => {
    return gulp.src('src/styles/**/*')
        .pipe(mylog())
        .pipe(sass().on('error', sass.logError))
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
    gulp.watch('./src/styles/*', ['styles']).on('change', browserSync.reload);
    gulp.watch('./src/js/*.js', ['scripts']).on('change', browserSync.reload);
    gulp.watch('./src/img/*', ['images']).on('change', browserSync.reload);
    gulp.watch('./src/video/*', ['video']).on('change', browserSync.reload);
});
