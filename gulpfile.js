// gulpfile.js

const settings = require("./package.json").settings;
const gulp = require("gulp");
const del = require("del");
const ts = require("gulp-typescript");
const browserify = require("browserify");
const browserifyInc = require("browserify-incremental");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const gutil = require("gulp-util");
const gulpif = require("gulp-if");
const changed = require("gulp-changed");
const rename = require("gulp-rename");
const browserSync = require("browser-sync");
const runSequence = require("run-sequence");
const tape = require("gulp-tape");
const through = require("through2");
const fs = require("fs");

const debug = settings.debug === true;

if (debug) { console.log("=== DEBUG Environment ===") }
else { console.log("=== RELEASE Environment ==="); }

// Clean destination directory
gulp.task("clean", () => {
    let files = ["./.cache.json", "./*.log"];
    if (debug) { files.push(settings.paths.debug + "*"); }
    else { files.push(settings.paths.release + "*"); }

    return del(files);
});

// Clean destination directory for all environnements
gulp.task("clean:all", () => {
    let files = ["./.cache.json", "./*.log"];
    files.push(settings.paths.debug + "*");
    files.push(settings.paths.release + "*");

    return del(files);
});

// Compile TypeScript files
gulp.task("compile", () => {
    let config = "";
    let dest = "";

    if (debug) {
        config = settings.tsconfig.debug;
        dest = settings.paths.debug;
    }
    else {
        config = settings.tsconfig.release;
        dest = settings.paths.release;
    }

    let tsProject = ts.createProject(config);
    return tsProject.src()
        .pipe(gulpif(debug, sourcemaps.init()))
        .pipe(tsProject()).js
        .pipe(gulpif(debug, sourcemaps.write()))
        .pipe(gulp.dest(dest))
        .on("error", gutil.log);
});

// Bundle JavaScript files into a single file
gulp.task("bundle", ["compile"], () => {
    const bundleFilename = settings.bundle;
    const mainFilename = settings.main;
    let dest = "";

    if (debug) { dest = settings.paths.debug;  }
    else { dest = settings.paths.release; }

    let b = browserifyInc({
            "entries": dest + mainFilename,
            "debug": true,
            "cache": "./.cache.json"
        })

    return b
        .bundle()
        .pipe(source(bundleFilename))
        .pipe(buffer())
        .pipe(gulpif(debug, sourcemaps.init({ loadMaps: true })))
        .pipe(uglify(/*{
            "mangle": {
                "properties": {
                    "keep_quoted": true
                }
            }
        }*/))
        .pipe(gulpif(debug, sourcemaps.write()))
        .pipe(gulp.dest(dest))
        .on("error", gutil.log)
        .on("finish", () => {
            if (!debug) {
                del([dest + "*.js", "!" + dest + bundleFilename]);
            }
        });
});

// Copy all static assets
gulp.task("copy", () => {
    let dest = "";

    if (debug) { dest = settings.paths.debug;  }
    else { dest = settings.paths.release; }

    if (debug) {
        gulp.src(settings.paths.src + "*.debug.html")
            .pipe(changed(dest))
            .pipe(rename(path => {
                path.basename = path.basename.split(".")[0];
            }))
            .pipe(gulp.dest(dest));
    }
    else {
        gulp.src([settings.paths.src + "*.html", "!" + settings.paths.src + "*.debug.html"])
            .pipe(changed(dest))
            .pipe(gulp.dest(dest));        
    }

    gulp.src(settings.paths.src + "*.json")
        .pipe(changed(dest))
        .pipe(gulp.dest(dest));

    gulp.src(settings.paths.src + "*.glsl")
        .pipe(changed(dest))
        .pipe(gulp.dest(dest));

    gulp.src(settings.paths.srcSounds + "**")
        .pipe(changed(dest))
        .pipe(gulp.dest(dest + settings.paths.tgtSounds));

    gulp.src(settings.paths.srcImages + "**")
        .pipe(changed(dest))
        .pipe(gulp.dest(dest + settings.paths.tgtImages));

    gulp.src(settings.paths.srcCss + "**")
        .pipe(changed(dest))
        .pipe(gulp.dest(dest + settings.paths.tgtCss));

    gulp.src("./node_modules/dat.gui/build/dat.gui.min.js")
        .pipe(changed(dest))
        .pipe(gulp.dest(dest));

    if (debug) {
        gulp.src("./node_modules/dat.gui/build/dat.gui.js.map")
            .pipe(changed(dest))
            .pipe(gulp.dest(dest));
    }
});

// Rebuild on change
gulp.task("watch", () => {
    runSequence(["bundle", "copy"], "test");
    gulp.watch(settings.paths.src + "**", () => {
        runSequence(["bundle", "copy"], "test");
    });
});

// Launch the HTTP server
gulp.task("serve", () => {
    let dest = "";

    if (debug) { dest = settings.paths.debug;  }
    else { dest = settings.paths.release; }
    
    browserSync.init({
        "port": settings.port,
        "server": dest
    });
});

// Rebuild on change and refresh the browser
gulp.task("watchRefresh", () => {
    runSequence(["bundle", "copy"], ["serve", "test"]);
    gulp.watch(settings.paths.src + "**", () => {
        runSequence(["bundle", "copy"], "test", browserSync.reload);
    });
});

// Default task
gulp.task("default", ["bundle", "copy"]);

// Unit tests
gulp.task("test", () => {
    if (!debug) return;

    process.stdout.write("\x1Bc");
    const reporter = through.obj();
    reporter
        .pipe(process.stdout);

    return gulp.src(settings.paths.tests + "*.js")
        .pipe(tape({
            "bail": false,
            "outputStream": fs.createWriteStream(settings.paths.tests + "tape.log"),
            "reporter": reporter
        }));
});
