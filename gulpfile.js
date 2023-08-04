// Importing specific gulp API functions
const { src, dest, watch, series, parallel } = require("gulp");

// Import all other Gulp-related packages
const rename = require("gulp-rename");
const sass = require("gulp-sass")(require("sass"));
const uglify = require("gulp-uglify");
const htmlmin = require('gulp-htmlmin');
const autoPrefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const plumber = require('gulp-plumber');
const browserify = require("browserify");
const babelify = require("babelify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const browsersync = require("browser-sync").create();
const del = require('del');

// All folder & file paths
const paths = {
    styles: {
        file: 'src/styles/style.scss',
        src: 'src/styles/**/*.scss',
        dest: 'build/css/'
    },
    scripts: {
        files: ['script.js'],
        dir: 'src/scripts/',
        src: 'src/scripts/**/*.js',
        dest: 'build/js/'
    },
    htmls: {
        src: 'src/**/*.html',
        dest: 'build/'
    },
    images: {
        src: 'src/images/**/*.{jpg,jpeg,png,svg,icon}',
        dest: 'build/images/'
    }
};

// Delete folders & files
async function clean() {
    return await del(['build']);
}

// browserSync to run a local server & auto reload HTTPS
function browserSync() {
    browsersync.init({
        server: {
            baseDir: "build/",
        },
    });
}

// browserSyncReload
function browserSyncReload(cb) {
    browsersync.reload();
    cb();
}

// style task: compiles SCSS to CSS and put final main.min.css file into build/css folder
function style() {
    return src(paths.styles.file)
        .pipe(sourcemaps.init())
        .pipe(
            sass({
                errorLogToConsole: true,
                outputStyle: "compressed",
            })
        )
        .on("error", console.error.bind(console))
        .pipe(
            autoPrefixer({
                overrideBrowserslist: ['last 2 versions', '> 5%', 'Firefox ESR'],
                cascade: false,
            })
        )
        .pipe(rename({
            basename: "main",
            suffix: ".min"
        }))
        .pipe(sourcemaps.write("./"))
        .pipe(dest(paths.styles.dest))
        .pipe(browsersync.stream());
}

// script task: compiles and bundle JS files and put final main.min.js file into build/js folder
async function script() {
    paths.scripts.files.map(function (entry) {
        return browserify({
            entries: [paths.scripts.dir + entry],
        })
            .transform(babelify, { presets: ["@babel/preset-env"] })
            .bundle()
            .pipe(source(entry))
            .pipe(rename({
                basename: "main",
                extname: ".min.js"
            }))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadmaps: true }))
            .pipe(uglify())
            .pipe(sourcemaps.write("./"))
            .pipe(dest(paths.scripts.dest))
            .pipe(browsersync.stream());
    });
}

// Put minified html files into build folder
function html() {
    return src(paths.htmls.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(paths.htmls.dest));
}
// Put image files into build folder
function images() {
    return src(paths.images.src)
        .pipe(plumber())
        .pipe(dest(paths.images.dest));
}

// watchFiles task: watch change(s) of HTML, SCSS and JS files.
function watchFiles() {
    watch(paths.styles.src, series(style, browserSyncReload));
    watch(paths.scripts.src, series(script, browserSyncReload));
    watch(paths.htmls.src, series(html, browserSyncReload));
    watch(paths.images.src, series(images, browserSyncReload));
}

//Export the Gulp tasks to run
const build = parallel(style, script, html, images);
const watcher = parallel(browserSync, watchFiles);
exports.clean = clean;
exports.default = series(clean, build, watcher);