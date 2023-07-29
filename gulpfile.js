// Importing specific gulp API functions
const { src, dest, watch, series, parallel } = require('gulp');

// Import all other Gulp-related packages
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify');
const autoPrefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browsersync = require("browser-sync").create();

// File paths
const styleSrc = 'src/scss/style.scss';
const styleDist = './dist/css/';

const scriptSrc = 'script.js';
const scriptFolder = 'src/js/';
const scriptDist = './dist/js/';

const styleWatch = 'src/scss/**/*.scss';
const scriptWatch = 'src/js/**/*.js';
const htmlWatch = 'src**/*.html';

// JS Files as an array
const scriptFiles = [scriptSrc];

// browserSync to run a local server & auto reload HTTPS
function browserSync() {
    browsersync.init({
        server: {
            baseDir: './src'
        }
    });
}

// browserSyncReload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

// style task: compiles SCSS to CSS and put final style.min.css file into dist/css folder
function style() {
    return src(styleSrc)
        .pipe(sourcemaps.init())
        .pipe(sass({
            errorLogToConsole: true,
            outputStyle: 'compressed'
        }))
        .on('error', console.error.bind(console))
        .pipe(autoPrefixer({
            overrideBrowserslist: ['last 2 versions', '> 5%', 'Firefox ESR'],
            cascade: false
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest(styleDist))
        .pipe(browsersync.stream());
}

// script task: compiles and bundle JS files and put final script.min.js file into dist/js folder
async function script() {
    scriptFiles.map(function (entry) {
        return browserify({
            entries: [scriptFolder + entry]
        })
            .transform(babelify, { presets: ['@babel/preset-env'] })
            .bundle()
            .pipe(source(entry))
            .pipe(rename({ extname: '.min.js' }))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadmaps: true }))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(dest(scriptDist))
            .pipe(browsersync.stream());
    });
}

// watchFiles task: watch change(s) of HTML, SCSS and JS files.
//If any change(s), run style and script tasks simultaneously
function watchFiles() {
    watch(htmlWatch, browserSyncReload);
    watch([styleWatch, scriptWatch], series(style, script));
}

// Export the default Gulp task to run
exports.default = series(parallel(style, script), parallel(browserSync, watchFiles));