'use strict';
var gulp = require('gulp')
  , del = require('del')
  , jshint = require('gulp-jshint')
  , plumber = require('gulp-plumber')
  , browserify = require('browserify')
  , source = require('vinyl-source-stream')
  , glob = require('glob')
  , mocha = require('gulp-mocha')
  , mochaPhantomJS = require('gulp-mocha-phantomjs')
  , size = require('gulp-size')
  , buffer = require('vinyl-buffer')
  ;

// Timeout for each integration test (in ms)
var INTEGRATION_TEST_TIMEOUT = 4000;

gulp.task('clean', function(cb) {
  del(['dist'], cb);
});

gulp.task('lint', function() {
  return gulp.src(['index.js', 'tests/**/*.js'])
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('browserify', function() {
  return browserify('./index.js', {
    standalone: 'st2client'
  }).bundle()
    .pipe(source('st2client.js'))
    .pipe(gulp.dest('dist'))
    .pipe(buffer())
    .pipe(size({
      showFiles: true
    }))
    .pipe(size({
      showFiles: true,
      gzip: true
    }));
});

gulp.task('browserify-tests', function() {
  return browserify(glob.sync('./tests/test-*.js'), {
    debug: true
  }).bundle()
    .pipe(source('tests.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('test', function () {
  return gulp.src('tests/**/*.js', {read: false})
    .pipe(mocha({
      reporter: 'base'
    }));
});

gulp.task('test-browser', ['browserify', 'browserify-tests'], function () {
  return gulp.src('tests/tests.html')
    .pipe(mochaPhantomJS({
      reporter: 'base'
    }));
});

gulp.task('test-integration', function () {
  var options = {'timeout': INTEGRATION_TEST_TIMEOUT};

  return gulp.src('integration/**/*.js', {read: false})
    .pipe(mocha(options));
});

gulp.task('build', ['browserify']);

gulp.task('watch', function() {
  gulp.watch(['index.js', 'tests/**/*.js'], ['lint', 'browserify']);
});

gulp.task('default', ['lint', 'browserify', 'browserify-tests', 'test', 'test-browser']);
