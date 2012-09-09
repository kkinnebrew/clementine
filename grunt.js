/*global module:false, require:false, path: false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/**\n * <%= pkg.title || pkg.name %> | <%= pkg.version %> | ' + '<%= grunt.template.today("mm.dd.yyyy") %>\n' + ' * <%= pkg.homepage ? pkg.homepage : "" %>\n' + ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n */'
    },
    lint: {
      files: ['grunt.js', 'lib/*.js', 'demos/stocks/js/*.js', 'spec/**/*.js']
    },
    qunit: {
      files: []
    },
    mocha: {
      files: [
        'spec/orange/orange.html',
        'spec/location/location.html',
        'spec/cache/cache.html',
        'spec/storage/storage.html',
        'spec/view/view.html',
        'spec/binding/binding.html',
        'spec/model/model.html',
        'spec/collection/collection.html',
        'spec/form/form.html',
        'spec/service/service.html',
        'spec/controller/controller.html',
        'spec/app/app.html'
      ]
    },
    concat: {
      dist: {
        src: [
          '<banner:meta.banner>',
          'lib/orange.js',
          'lib/cache.js',
          'lib/collection.js',
          'lib/form.js',
          'lib/location.js',
          'lib/model.js',
          'lib/storage.js',
          'lib/service.js',
          'lib/view.js',
          'lib/auth.js',
          'lib/binding.js',
          'lib/controller.js',
          'lib/app.js'
        ],
        dest: 'build/<%= pkg.version %>/orange-<%= pkg.version %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'build/<%= pkg.version %>/orange-<%= pkg.version %>.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint concat min'
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
        Orange: true,
        Log: true,
        Events: true,
        Class: true,
        proxy: true,
        include: true,
        describe: true,
        app: true,
        md5: true,
        it: true,
        clone: true,
        firstChildren: true,
        expect: true,
        noop: true,
        before: true,
        after: true,
        QUOTA_EXCEEDED_ERR: true
      }
    },
    uglify: {}
  });

  // load tasks
  grunt.loadNpmTasks('grunt-mocha');
    
  // Default task.
  grunt.registerTask('default', 'lint concat min');

};
