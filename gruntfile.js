module.exports = function (grunt) {
    var lessSrc = './src/less/*.less',
        jsSrc = './src/js/*.js';
    grunt.initConfig({
        copy: {
            img: {
                expand: true,
                cwd: './src/templates/',
                src: '**',
                dest: './dist/templates/'
            },
            templates: {
                expand: true,
                cwd: './src/img/',
                src: '**',
                dest: './dist/img/'
            }
        },
        uglify: {
            dist: {
                files: {
                    './dist/js/fm.min.js': [
                        'app',
                        'services',
                        'controllers',
                        'directives',
                        'boot',
                        'plugin'
                    ].map(function (file) {
                            return './src/js/fm.' + file + '.js';
                        })
                }
            }
        },
        jshint: {
            dev: [jsSrc]
        },
        less: {
            dev: {
                files: {
                    './src/css/fm.css': lessSrc
                }
            },
            dist: {
                options: {
                    compress: true
                },
                files: {
                    './dist/css/fm.min.css': lessSrc
                }
            }
        },
        watch: {
            dev: {
                files: [lessSrc, jsSrc],
                tasks: ['less:dev', 'jshint']
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['watch']);
    grunt.registerInitTask('dist', ['uglify', 'less:dist', 'copy']);
};