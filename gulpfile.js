// 获取gulp
var gulp = require('gulp');
// 获取同步刷新插件
var browserSync = require('browser-sync').create();
// 获取压缩html插件
var htmlmin = require('gulp-htmlmin');
// 获取压缩js插件
var uglify = require('gulp-uglify');
// 获取less编译插件
var less = require('gulp-less');
// 获取压缩css插件
var minifyCss = require('gulp-minify-css');

// 新建一个压缩html任务
gulp.task('html',function(){
  // 读取index.html文件
  gulp.src('index.html')
  // 传送至压缩htmlmin
  .pipe(htmlmin({
    // 清除空格
    collapseWhitespace:true,
    // 清除注释
    removeComments:true
  }))
  .pipe(gulp.dest('dist/'))
  .pipe(browserSync.stream());
  // 读取page下的html
  gulp.src('page/**/*.html')
  .pipe(htmlmin({
    // 清除空格
    collapseWhitespace:true,
    // 清除注释
    removeComments:true
  }))
  .pipe(gulp.dest('dist/page'))
  .pipe(browserSync.stream());
});
// 新建一个压缩js任务
gulp.task('js',function(){
  gulp.src('js/**/*.js')
  .pipe(uglify())
  .pipe(gulp.dest('dist/js'))
  .pipe(browserSync.stream());
});
// 新建一个less编译css压缩任务
gulp.task('less',function(){
  gulp.src('less/**/*.less')
  .pipe(less())
  .pipe(minifyCss())
  .pipe(gulp.dest('dist/css'))
  .pipe(browserSync.stream());
});
// 新建一个copy图片到dist文件夹任务
gulp.task('imgCopy',function(){
  gulp.src('images/**/*.*')
  .pipe(gulp.dest('dist/images'))
  .pipe(browserSync.stream());
});
// 新建一个监视任务监视文件变化
gulp.task('watch',function(){
  // 监视HTML文件
  gulp.watch(['index.html','page/**/*.html'],['html']);
  // 监视js文件
  gulp.watch('js/**/*.js',['js']);
  // 监视less文件
  gulp.watch('less/**/*.less',['less']);
  // 监视img文件
  gulp.watch('images/**/*.*',['imgCopy']);
});
// 新建一个刷新浏览器任务
gulp.task('browser-sync',function(){
  browserSync.init({
    server:{
      baseDir:'./dist'
    },
    port:80
  });
});
// 新建一个copy，Lib文件任务
gulp.task('lib',function(){
  gulp.src('lib/**/*.*')
  .pipe(gulp.dest('dist/lib/'));
});
gulp.task('default',['html','js','less','imgCopy','watch','browser-sync'])
