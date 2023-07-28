// Importing specific gulp API functions
const { src, dest, watch, series, parallel } = require('gulp');

// Import all other Gulp-related packages
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const autoPrefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');

// File paths
const styleSrc = './src/scss/style.scss';
const styleDist = './dist/css/';
const styleWatch = 'src/scss/**/*.scss';

const scriptSrc = './src/js/script.js';
const scriptDist = './dist/js/';
const scriptWatch = 'src/js/**/*.js';

// style task: compiles SCSS to CSS and put final style.min.css file in dist/css folder
function style() {
    return src(styleSrc)
        .pipe(sourcemaps.init())
        .pipe(sass({
            errorLogToConsole: true,
            outputStyle: 'compressed'
        }))
        .on('error', console.error.bind(console))
        .pipe(autoPrefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('./'))
        .pipe(dest(styleDist));
}

// script task: concatenates and uglifies JS files and put final script.min.js file in dist/js folder
function script() {
    return src(scriptSrc)
        .pipe(dest(scriptDist));
}

// watchFiles task: watch change(s) of HTML, SCSS and JS files.
//If any change(s), run style and script tasks simultaneously
function watchFiles() {
    watch([styleWatch, scriptWatch], series(style, script));
}

// Export the default Gulp task to run
exports.default = series(style, script, watchFiles);