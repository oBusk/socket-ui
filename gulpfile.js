var gulp = require('gulp');
var spawn = require('child_process').spawn;
var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var node;

/** 
 * Define the default task. 
 */
gulp.task('default', ['watch']);

/**
 * This should run everything needed to build the entire app 
 */
gulp.task('build', ['scripts']);

gulp.task('scripts', function () {
    console.log("Compiling typescript");
    
    // Read the TS projectfile
    var tsProject = ts.createProject('tsconfig.json');

    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));

    return tsResult.js
        .pipe(concat('app.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('generated'));
});

/**
 * Make sure project is built before we start watching
 */
gulp.task('watch', ['run'], function () {
    gulp.watch(['./*.ts'], ['scripts', 'server']);
});

/**
 * Task to run the server (ensures app was compiled before running)
 */
gulp.task('run', ['build', 'server']);

/**
 * https://gist.github.com/webdesserts/5632955
 * launch the server. If there's a server already running, kill it.
 */
gulp.task('server', ['build'], function () {
    if (node) node.kill()
    node = spawn('node', ['generated/app.js'], { stdio: 'inherit' })
    node.on('close', function (code) {
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
    });
})

// clean up if an error goes unhandled.
process.on('exit', function () {
    if (node) node.kill()
})