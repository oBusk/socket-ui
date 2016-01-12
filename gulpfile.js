var gulp = require('gulp');
var path = require('path');
var del = require('del');
var ts = require('gulp-typescript');
var tsd = require('gulp-tsd');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');

/** 
 * Define the default task. 
 */
gulp.task('default', ['scripts']);

gulp.task('clean', ['server:clean', 'display:clean']);
gulp.task('scripts', ['server:scripts', 'display:scripts']);
gulp.task('tsd', ['server:tsd', 'display:tsd']);
gulp.task('watch', ['server:scripts:watch', 'display:scripts:watch']);
gulp.task('browser-sync', ['display:browser-sync']);
gulp.task('develop', ['watch', 'nodemon', 'browser-sync']); // watch for changes in any module, run server, browsersync.

var serverPath = "server";
var serverBuiltPath = path.join(serverPath, "built");
var serverExecutableName = "app.js";// TODO: read outFile from tsconfig.json

gulp.task('server:clean', function (cb) {
    return del([
        serverBuiltPath,
        path.join(serverPath, "typings"),// TODO: read foldername from tsd.json
    ]);
});

gulp.task('server:tsd', function (cb) {
    tsd({
        "command": "reinstall",
        "config": path.join(serverPath, "tsd.json"),
        "latest": false,
    }, cb);
});

gulp.task('server:scripts', function () {
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

gulp.task('server:scripts:watch', ['server:scripts'], function () {
    return gulp.watch(path.join(serverPath, '**.ts'), ['server:scripts']);
});

gulp.task('nodemon', ['scripts'], function (cb) {
    var started = false;

    return nodemon({
        script: path.join(serverBuiltPath, serverExecutableName), // the server node script
        watch: serverBuiltPath,
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        if (!started) {
            cb();
            started = true;
        }
    }).on('restart', function () {
        setTimeout(function () {
            browserSync.reload();
        }, 500); // #lukas - there's no better way i'm afraid...
    });
});

var displayPath = "display";
var displayServePath = path.join(displayPath, "serve");
var displayBuiltPath = path.join(displayServePath, "js");
var displayConcatName = "app.js";

gulp.task('display:clean', function () {
    return del([
        displayBuiltPath,
        path.join(displayPath, "typings"),// TODO: read foldername from tsd.json
    ])
});

gulp.task('display:tsd', function (cb) {
    tsd({
        "command": "reinstall",
        "config": path.join(displayPath, "tsd.json"),
        "latest": false,
    }, cb);
});

gulp.task('display:scripts', function () {
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

gulp.task('display:scripts:watch', ['display:scripts'], function () {
    return gulp.watch(path.join(displayPath, "**.ts"), ['display:scripts']);
});

gulp.task('display:browser-sync', ['display:scripts:watch', 'nodemon'], function () {
    browserSync.init({
        proxy: {
            target: "http://localhost:1337",// TODO: this port needs to be stored somewhere
            ws: true, // tell browsersync we need to use websockets http://apsdsm.com/browsersync-with-socket-io/
        },
        files: [path.join(displayServePath, "**.*")],
    });
});