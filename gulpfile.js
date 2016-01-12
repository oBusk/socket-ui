var gulp = require('gulp');
var path = require('path');
var del = require('del');
var spawn = require('child_process').spawn;
var ts = require('gulp-typescript');
var tsd = require('gulp-tsd');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');

var node;

/** 
 * Define the default task. 
 */
gulp.task('default', ['build']);

gulp.task('clean', ['server:clean', 'display:clean']);
gulp.task('build', ['server:build', 'display:build']);
gulp.task('tsd', ['server:tsd', 'display:tsd']);
gulp.task('watch', ['build', 'server:watch', 'display:watch']);
/** Builds everything and starts server (thourough) */
gulp.task('run', ['tsd', 'build', 'server']);
gulp.task('cleanrun', ['clean', 'tsd', 'run']); // doesn't work :( gulp-tsd doesn't handle the callback as it should

var serverPath = "server";
var serverBuiltPath = path.join(serverPath, "built");
var serverExecutableName = "app.js";// TODO: read outFile from tsconfig.json

gulp.task('server:clean', function (cb) {
    return del([
        serverBuiltPath,
        path.join(serverPath, "typings")// TODO: read foldername from tsd.json
    ]);
});

/**
 * downloads all the definition/typings files.
 */
gulp.task('server:tsd', function (cb) {
    tsd({
        "command": "reinstall",
        "config": path.join(serverPath, "tsd.json"),
        "latest": false
    }, cb);
});

/**
 * compiles the server.
 * requires that gulp-tsd has fetched all the typings.
 */
gulp.task('server:build', function () {
    console.log("Compiling server typescript");
    
    // Read the TS projectfile
    var tsProject = ts.createProject(path.join(serverPath, 'tsconfig.json'));

    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));

    return tsResult.js
        .pipe(concat(serverExecutableName))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(serverBuiltPath));
});

gulp.task('server:watch', ['server'], function () {
    return gulp.watch(path.join(serverPath, '**.ts'), ['server:build', 'server']);
});

/**
 * https://gist.github.com/webdesserts/5632955
 * launch the server. If there's a server already running, kill it.
 */
gulp.task('server', ['server:build'], function () {
    if (node) node.kill()
    node = spawn('node', [path.join(serverBuiltPath, serverExecutableName)], { stdio: 'inherit' })
    node.on('close', function (code) {
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
    });
});

var displayPath = "display";
var displayConcatName = "app.js";
var displayServePath = path.join(displayPath, "serve");
var displayBuiltPath = path.join(displayServePath, "js");

gulp.task('display:clean', function () {
    return del([
        displayBuiltPath,
        path.join(displayPath, "typings")// TODO: read foldername from tsd.json
    ])
});

gulp.task('display:tsd', function (cb) {
    tsd({
        "command": "reinstall",
        "config": path.join(displayPath, "tsd.json"),
        "latest": false
    }, cb);
});

gulp.task('display:build', function () {
    console.log("Compiling display typescript");
    
    // Read the TS projectfile
    var tsProject = ts.createProject(path.join(displayPath, 'tsconfig.json'));

    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));

    return tsResult.js
        .pipe(concat(displayConcatName))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(displayBuiltPath));
});

gulp.task('display:watch', ['display:build'], function () {
    return gulp.watch(path.join(displayPath, "**.ts"), ['display:build']);
});

// clean up if an error goes unhandled.
process.on('exit', function () {
    if (node) node.kill()
})