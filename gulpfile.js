/* File: gulpfile.js */

// grab our gulp packages
var gulp = require('gulp');
var cleanDir = require('gulp-dest-clean');
var htmlclean = require('gulp-htmlclean');
var sass = require('gulp-sass');
var server = require('gulp-server-livereload');
var livereload = require('gulp-livereload');
var postcss = require('gulp-postcss');

gulp.task('default', ['build-all', 'webserver', 'watch']);
gulp.task('build-all', ['build-sass', 'build-js', 'build-misc', 'build-html']);


gulp.task('watch', function() {
    // livereload.listen({
    //     host: '0.0.0.0',
    //     port: 3000,
    //     basePath: 'build',
    //     quiet: true
    // });

    gulp.watch(['src/**/*', 'gulpfile.js'], function(d) {
        logFile(getFile(d));
    });

    gulp.watch('gulpfile.js', exit);

    gulp.watch(['src/javascript/**/*.js', 'src/javascript/**/*.json'], ['build-js']);
    gulp.watch('src/sass/**/*.scss', ['build-sass']);
    gulp.watch('src/*.html', ['build-html']);
    gulp.watch('src/misc/**/*.*', ['build-misc']);
});


gulp.task('webserver', function() {
    gulp.src('build/')
        .pipe(server({
            livereload: true,
            host: '0.0.0.0',
            port: 3000,
            log: 'debug'
        }));
});

gulp.task('build-js', function(e) {
    var src = 'src/javascript';
    var build = 'build/javascript';

    return gulp.src([src + '/**/*.js', src + '/**/*.json'])
        .pipe(cleanDir(build))
        .pipe(gulp.dest(build))
        .pipe(livereload());
});


gulp.task('build-sass', function(e) {
    var src = 'src/sass/**/*.scss';
    var build = 'build/stylesheets';

    return gulp.src(src)
        .pipe(postcss([require('postcss-easing-gradients')])) //gradient plugin
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanDir(build))
        .pipe(gulp.dest(build));
});

gulp.task('build-misc', function(e) {
    var src = 'src/misc/**/*.*';
    var build = 'build/misc';

    return gulp.src(src)
        .pipe(cleanDir(build))
        .pipe(gulp.dest(build))
})

gulp.task('build-html', function(e) {
    var src = 'src/*.html';
    var build = 'build';

    return gulp.src(src)
        .pipe(htmlclean())
        .pipe(gulp.dest(build));
});


function exit() {
    process.exit();
}


function logFile(t) {
    if (t) {
        console.log("File " + t + " changed.");
    } else {
        console.log(t);
    }
}

function getFile(d) {
    var fileChanged = "";
    var path, last, fileChanged;

    if (d.path) {
        path = d.path;
        last = path.lastIndexOf("\\") + 1;
        fileChanged = path.substr(last, path.length);
    }

    return fileChanged;
}