var gulp = require('gulp');
var connect = require('gulp-connect');
var htmlmin = require('gulp-htmlmin');
// 获取压缩js插件
var uglify = require('gulp-uglify');
// 获取less编译插件
var less = require('gulp-less');
// 获取压缩css插件
var minifyCss = require('gulp-minify-css');

var proxy = require('http-proxy-middleware');
var babel = require('gulp-babel');

gulp.task('html', function () {
  gulp.src("app/index.html")
    .pipe(htmlmin({
      // 清除空格
      collapseWhitespace: true,
      // 清除注释
      removeComments: true
    }))
    .pipe(gulp.dest('dist/'))
    .pipe(connect.reload());

  gulp.src("app/pages/**/*.html")
    .pipe(htmlmin({
      // 清除空格
      collapseWhitespace: true,
      // 清除注释
      removeComments: true
    }))
    .pipe(gulp.dest('dist/pages'))
    .pipe(connect.reload());
})

gulp.task('js', function () {
  gulp.src('app/static/js/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist/static/js'))
    .pipe(connect.reload());
});

gulp.task('less', function () {
  gulp.src('app/static/less/**/*.less')
    .pipe(less())
    .pipe(minifyCss())
    .pipe(gulp.dest('dist/static/css'))
    .pipe(connect.reload());
});

gulp.task('imgCopy', function () {
  gulp.src('app/static/images/**/*.*')
    .pipe(gulp.dest('dist/static/images'))
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  // 监视HTML文件
  gulp.watch(['app/index.html', 'app/pages/**/*.html'], ['html']);
  // 监视js文件
  gulp.watch('app/static/js/**/*.js', ['js']);
  // 监视less文件
  gulp.watch('app/static/less/**/*.less', ['less']);
  // 监视img文件
  gulp.watch('app/static/images/**/*.*', ['imgCopy']);
});


gulp.task('connectDist', function () {
  connect.server({
    name: 'Dist',
    root: 'dist',
    port: 8001,
    livereload: true,
    middleware: function (connect, opt) {
      return [
        proxy('/api', {
          target: 'http://localhost:8088',
          changeOrigin: true,
          pathRewrite: {
            '^/api': '',
          },
        }),
        proxy('/otherServer', {
          target: 'http://IP:Port',
          changeOrigin: true
        })
      ]
    }
  });
});

gulp.task('default', ['connectDist', 'watch']);
