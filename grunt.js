/*global module:false, require:false, path: false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/**\n * <%= pkg.title || pkg.name %> | <%= pkg.version %> | ' + '<%= grunt.template.today("mm.dd.yyyy") %>\n' + ' * <%= pkg.homepage ? pkg.homepage : "" %>\n' + ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n */'
    },
    lint: {
      files: ['grunt.js', 'src/*.js']
    },
    qunit: {
      files: []
    },
    mocha: {
      files: ['specs/*.js']
    },
    concat: {
      dist: {
        src: [
          '<banner:meta.banner>',
          'src/clementine.js',
          'src/controller.js',
          'src/view.js',
          'src/service.js',
          'src/app.js'
        ],
        dest: 'build/<%= pkg.version %>/clementine-<%= pkg.version %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'build/<%= pkg.version %>/clementine-<%= pkg.version %>.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'csslint lint'
    },
    jshint: {
      options: {
        bitwise: true,
        curly: true,
        eqeqeq: true,
        forin: false,
        immed: true,
        latedef: true,
        newcap: false,
        noarg: true,
        plusplus: false,
        sub: true,
        smarttabs: false,
        trailing: true,
        undef: true,
        boss: true,
        loopfunc: true,
        laxbreak: true,
        eqnull: true,
        browser: true,
        devel: true,
        jquery: true,
        node: true
      },
      globals: {
        jQuery: true,
        DocumentTouch: true,
        Clementine: true,
        Log: true,
        Events: true,
        Class: true,
        proxy: true,
        include: true,
        QUOTA_EXCEEDED_ERR: true
      }
    },
    uglify: {}
  });
    
  // Default task.
  grunt.registerTask('default', 'concat min');

};
