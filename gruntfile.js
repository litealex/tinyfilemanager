module.exports = function (grunt) {
    var lessSrc = './src/less/*.less',
        jsSrc = './src/js/*.js';
    grunt.initConfig({
        jshint: {
            dev: [jsSrc]
        },
        less: {
            dev: {
                files: {
                    './src/css/fm.css': lessSrc
                }
            }
        },
        watch: {
            dev: {
                files: [lessSrc, jsSrc],
                tasks: ['less', 'jshint']
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['watch']);
};