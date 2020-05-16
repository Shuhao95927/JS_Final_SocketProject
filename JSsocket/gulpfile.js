const gulp =require('gulp');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const concat = require('gulp-concat');

function message(){
    console.log('Gulp is running!');
}
exports.message = message;

function copyHTML(){
    return gulp
        .src('src/*.html')
        .pipe(gulp.dest('dist'));
}
exports.copyHTML = copyHTML;

function imageMin(){
    return gulp
        .src('src/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'));
}
exports.imageMin = imageMin;

// function minifyJS(){
//     return gulp
//         .src('src/publicJS/*.js')
//         .pipe(gulp.dest('dist/js'));
// }
// exports.minifyJS = minifyJS;


function sassworkflow(){
    return gulp
        .src('src/sass/*.scss')
        .pipe(sass().on('error',sass.logError))
        .pipe(gulp.dest('dist/css'));
}
exports.sassworkflow = sassworkflow;

//Scripts
function scripts(){
    return gulp
        .src('src/publicJS/*.js')
        .pipe(concat('main.js'))
        // .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
}
exports.scripts = scripts;

function watch(){
    gulp.watch('src/publicJS/*.js',['scripts']);
    gulp.watch('src/sass/*.scss',['sass']);
    gulp.watch('src/*.html',['copyHTML']);
    gulp.watch('src/images',['imageMin']);
}
exports.watch = watch;

const build = gulp.parallel(message,copyHTML,imageMin,sassworkflow,scripts);

gulp.task('default',gulp.series(build,watch));