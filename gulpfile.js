var gulp     = require('gulp'),
    cssnano  = require('gulp-cssnano'),
    rename   = require('gulp-rename'),
    sass     = require('gulp-sass'),
    closureCompiler = require('google-closure-compiler').gulp();

var supported_browsers = [
    'last 3 versions',
    'Chrome > 37',
    'Firefox > 33',
    'Opera > 25',
    'not IE 9',
    'Edge >= 12',
    'Safari >= 6',
    'iOS >= 6',
];

gulp.task('build-css', function () {
    return gulp.src('dev/bubator.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('dist/'))
        .pipe(cssnano({
            'zindex': false,
            'reduce-transforms': false,
            'autoprefixer': {browsers: supported_browsers, add: true}
        }))
        .pipe(rename('bubator.min.css'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('build-js', function () {
    return gulp.src('dev/bubator.js')
        .pipe(closureCompiler({
            compilation_level: 'ADVANCED',
            warning_level: 'VERBOSE',
            language_in: 'ECMASCRIPT5_STRICT',
            language_out: 'ECMASCRIPT5_STRICT',
            js_output_file: 'bubator.min.js'
        }, {
            platform: ['native', 'java', 'javascript']
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('build-es6', function () {
    return gulp.src('dev/bubator-es6.js')
        .pipe(closureCompiler({
            compilation_level: 'ADVANCED',
            warning_level: 'VERBOSE',
            language_in: 'ECMASCRIPT_2015',
            language_out: 'ECMASCRIPT_2015',
            js_output_file: 'bubator-es6.min.js'
        }, {
            platform: ['native', 'java', 'javascript']
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('watch', function () {
    gulp.watch('dev/*.scss', ['build-css']);
    gulp.watch('dev/*.js', ['build-js']);
});
