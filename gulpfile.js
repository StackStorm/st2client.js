'use strict';
var gulp = require('gulp')
  , assign = Object.assign || require('object.assign')
  , del = require('del')
  , jshint = require('gulp-jshint')
  , plumber = require('gulp-plumber')
  , browserify = require('browserify')
  , source = require('vinyl-source-stream')
  , glob = require('glob')
  , mocha = require('gulp-mocha')
  , mochaPhantomJS = require('gulp-mocha-phantomjs')
  , size = require('gulp-size')
  , sourcemaps = require('gulp-sourcemaps')
  , buffer = require('vinyl-buffer')
  ;

var builtins = assign({}, require('browserify/lib/builtins'), {
  http: require.resolve('./lib/util/http'),
  https: require.resolve('./lib/util/https'),
  // This one deserves a massive warning:
  // BEWARE, NOCK IN BROWSER TESTS IS NOT THE SAME AS THE ONE IN NODE TESTS
  // I'm overriding it here to reduce the size of diff.
  // TODO: inline the change during refactoring
  nock: require.resolve('./lib/util/mock')
});

// Timeout for each integration test (in ms)
var INTEGRATION_TEST_TIMEOUT = 10000;

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
    standalone: 'st2client',
    builtins: builtins
  }).bundle()
    .pipe(source('st2client.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist'))
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
    debug: true,
    builtins: builtins
  }).bundle()
    .pipe(source('tests.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
});

gulp.task('test', function () {
  return gulp.src('tests/**/*.js', {read: false})
    .pipe(mocha({
      reporter: process.env.reporter || 'base'
    }));
});

gulp.task('test-browser', ['browserify', 'browserify-tests'], function () {
  return gulp.src('tests/tests.html')
    .pipe(mochaPhantomJS({
      reporter: process.env.reporter || 'base',
      phantomjs: {
        useColors: true
      }
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
