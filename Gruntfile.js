module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    exec_jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
    },

    mocha_debug: {
      options: {
        reporter: 'dot',
        check: ['src/**/*.js', 'test/**/*.js']
      },
      nodejs: {
        options: {
          src: ['src/**/*.js', 'test/**/*.js']
        }
      }
    },

    watch: {
      options: {
        nospawn: true
      },
      all: {
        files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
        tasks: ['test']
      }
    }
  });

  grunt.event.on('watch', function(action, filepath) {
    grunt.config('exec_jshint.all', [filepath]);
    grunt.regarde = { changed: ['test.js'] };
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec-jshint');
  grunt.loadNpmTasks('grunt-mocha-debug');
  grunt.loadNpmTasks('grunt-release');

  grunt.registerTask('test', ['exec_jshint', 'mocha_debug']);
  grunt.registerTask('publish', ['mocha_debug', 'release']);

  grunt.registerTask('default', ['test', 'watch']);
};
