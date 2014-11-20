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
  ;

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
    standalone: 'st2api'
  }).bundle()
    .pipe(source('st2.js'))
    .pipe(gulp.dest('dist'));
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
      reporter: 'dot'
    }));
});

gulp.task('test-browser', ['browserify', 'browserify-tests'], function () {
  return gulp.src('tests/tests.html')
    .pipe(mochaPhantomJS({
      reporter: 'dot'
    }));
});

gulp.task('test-integration', function () {
  return gulp.src('integration/**/*.js', {read: false})
    .pipe(mocha());
});

gulp.task('watch', function() {
  gulp.watch(['index.js', 'tests/**/*.js'], ['lint', 'browserify']);
});

gulp.task('default', ['lint', 'browserify', 'browserify-tests', 'test', 'test-browser']);
