module.exports = function(grunt) {
   'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
//    concat: {
//      options: {
//        separator: ';'
//      },
//      dist: {
//        src: ['src/**/*.js'],
//        dest: 'dist/<%= pkg.name %>.js'
//      }
//    },
//    
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyymmdd") %> */\n'
      }
      // target location handled by usemin
    },

   clean: [ 'dist', '.tmp' ], // '.tmp' is created by usemin
  
   copy: {
      main: {
         expand: true,
         cwd: 'src',
         src: [ '*.html', '*.json', 'css/**', 'fonts/**', 'res/**' ],
         dest: 'dist/',
      },
   },

   useminPrepare: {
      html: 'src/index.html',
      options: {
         dest: 'dist'
      }
   },
   usemin: {
      html: 'dist/index.html'
   },
  
//    qunit: {
//      files: ['test/**/*.html']
//    },

    jshint: {
      //files: ['Gruntfile.js', 'src/**/*.js', 'examples/**/js/**/*.js'],
      files: ['src/**/*.js'],
      options: {
         jshintrc: '.jshintrc'
      }
    },
    
   'json-minify': {
      main: { // Minifies JSON in place
         files: 'dist/**/*.json'
      }
   },
   
   jsdoc: {
      main: {
         src: [ 'src/**/*.js' ],
         options: {
            destination: 'doc'
         }
      }
   },
   
   watch: {
      files: ['<%= jshint.files %>'],
      tasks: [ 'jshint' ]
   },
    
   compress: {
      main: { // Create the source zip file
         options: { archive: 'dw-src.zip' },
         files: [
            { expand: true, src: 'src/**' },
            { expand: true, src: [ 'Gruntfile.js', 'package.json' ] }
         ]
      }
   }
   
  });
   
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
//  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-json-minify');
  grunt.loadNpmTasks('grunt-usemin');

  grunt.registerTask('test', ['jshint'/*, 'qunit'*/]);
  grunt.registerTask('default', ['jshint', 'copy', 'useminPrepare', 'concat', 'uglify', 'usemin', 'json-minify']);
  grunt.registerTask('doc', ['jsdoc']);
  grunt.registerTask('make-src-zip', ['compress']);

};
