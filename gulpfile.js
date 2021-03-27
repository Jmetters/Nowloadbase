// Custom gulp file for wordpress
const gulp = require("gulp");
const env = require("./gulp-env")();
const config = require("./gulp-config")();
const $ = require("gulp-load-plugins")({ lazy: true });
const browserSync = require("browser-sync").create();
const del = require("del");
var concat = require('gulp-concat');
const minify = require('gulp-minify');
var strip = require('gulp-strip-comments');

const Tasks = (function() {
  function compileStyles() {
    return gulp
      .src(config.styles.source)
      .pipe(Jobs.error())
      .pipe($.sourcemaps.init())
      .pipe($.sass(config.options.sass))
      .pipe($.autoprefixer(config.options.autoPrefixerOptions))
      .pipe($.sourcemaps.write("./"))
      .pipe(gulp.dest(config.styles.build))
      .pipe(browserSync.stream());
  }
  function compileAccStyles() {
    return gulp
      .src(config.accStyles.source)
      .pipe(Jobs.error())
      .pipe($.sourcemaps.init())
      .pipe($.sass(config.options.sass))
      .pipe($.autoprefixer(config.options.autoPrefixerOptions))
      .pipe($.sourcemaps.write("./"))
      .pipe(gulp.dest(config.accStyles.build))
      .pipe(browserSync.stream());
  }

  function compileStylesDefer() {
    return gulp
      .src(config.stylesDefer.source)
      .pipe(Jobs.error())
      .pipe($.sourcemaps.init())
      .pipe($.sass(config.options.sass))
      .pipe($.autoprefixer(config.options.autoPrefixerOptions))
      .pipe($.sourcemaps.write("./"))
      .pipe(gulp.dest(config.stylesDefer.build))
      .pipe(browserSync.stream());
  }

  function compileScripts() {
    return gulp
      .src(config.scripts.source)
      .pipe(Jobs.error())
      .pipe($.changed(config.scripts.build))
      .pipe($.babel({
        "presets": ["@babel/preset-env"],
        "plugins": ["@babel/plugin-proposal-optional-chaining", "@babel/plugin-proposal-object-rest-spread"]
      }))
      .pipe(concat('scripts.js'))
      .pipe($.sourcemaps.write("./"))
      .pipe(strip())
      .pipe(minify())
      .pipe(gulp.dest(config.scripts.build))
      .pipe(browserSync.stream());
  }

  function compileScriptsDefer() {
    return gulp
        .src(config.scriptsDefer.source)
        .pipe(Jobs.error())
        .pipe($.changed(config.scriptsDefer.build))
        .pipe($.babel({
          "presets": ["@babel/preset-env"],
          "plugins": ["@babel/plugin-proposal-optional-chaining", "@babel/plugin-proposal-object-rest-spread"]
        }))
        .pipe(concat('scripts.js'))
        .pipe($.sourcemaps.write("./"))
        .pipe(strip())
        .pipe(minify())
        .pipe(gulp.dest(config.scriptsDefer.build))
        .pipe(browserSync.stream());
  }

  function compileHTML() {
    return gulp
      .src(config.html.source)
      .pipe($.changed(config.html.build))
      .pipe(gulp.dest(config.html.build));
  }

  // Creating the task for compiling plugin html
  function compilePluginHTML() {
    return gulp
      .src(config.html.source)
      .pipe($.changed(config.html.build))
      .pipe(gulp.dest(config.html.build));
  }

  function compileImages() {
    return gulp
      .src(config.images.source)
      .pipe($.changed(config.images.build))
      .pipe(gulp.dest(config.images.build));
  }

  return {
    compileStyles: compileStyles,
    compileAccStyles: compileAccStyles,
    compileStylesDefer: compileStylesDefer,
    compileScripts: compileScripts,
    compileScriptsDefer: compileScriptsDefer,
    compileHTML: compileHTML,
    compileImages: compileImages,
    // exposing the tasks functions specific to plugin
    compilePluginHTML: compilePluginHTML,
  };
})();

const Server = (function() {
  function reload(next) {
    browserSync.reload();
    next();
  }

  function start(next) {
    if (env.devURL == "./") {
      config.browserSync["server"] = {
        baseDir: `${env.buildPath}/`,
      };
    } else {
      config.browserSync["proxy"] = env.devURL;
    }
    browserSync.init(null, config.browserSync);
    next();
  }
  return {
    reload: reload,
    start: start,
  };
})();

const Jobs = (function() {
  function clean() {
    return del([env.buildPath]);
  }

  function watch() {
    gulp.watch(config.styles.mainSource, gulp.series(Tasks.compileStyles));
    gulp.watch(config.accStyles.mainSource, gulp.series(Tasks.compileAccStyles));
    // gulp.watch(config.stylesDefer.mainSource, gulp.series(Tasks.compileStylesDefer, Server.reload));
    // gulp.watch(config.scripts.source, gulp.series(Tasks.compileScripts, Server.reload));
    // gulp.watch(config.scriptsDefer.source, gulp.series(Tasks.compileScriptsDefer, Server.reload));
    gulp.watch(config.html.source, gulp.series(Server.reload));
    //gulp.watch(config.images.source, gulp.series(Tasks.compileImages, Server.reload));
    // setting up plugin specific watchers
    gulp.watch(config.pluginHTML.source, gulp.series(Server.reload));
  }

  function errorHandler() {
    return $.plumber({
      errorHandler: function(err) {
        $.notify.onError({
          title: `Error : ${err.plugin}`,
          message: `Issue : ${err}`,
          sound: false,
        })(err);

        console.log(`

  /////////////////////////////////////
  /////////////////////////////////////
  Error: ${err.plugin}
  Issue : ${err}
  /////////////////////////////////////
  /////////////////////////////////////

  `);
        this.emit("end");
      },
    });
  }

  return {
    clean: clean,
    watch: watch,
    error: errorHandler,
  };
})();

gulp.task(
  "default",
  gulp.series(
    // gulp.parallel(Tasks.compileStyles, Tasks.compileScripts, Tasks.compilePluginScripts, Tasks.compileImages),
    // gulp.parallel(Tasks.compileStyles, Tasks.compileScripts),
    gulp.parallel(Tasks.compileStyles, Tasks.compileAccStyles),
    Server.start,
    Jobs.watch,
  ),
);

gulp.task(
  "compile-project",
  gulp.series(
    gulp.parallel(Tasks.compileStyles, Tasks.compileScripts),
  ),
);
