module.exports = function (grunt) {
    var lessSrc= './src/less/*.less'
    grunt.initConfig({
        less:{
            dev:{
                files: {
                    './src/css/fm.css': lessSrc
                }
            }
        },
        watch: {
            dev:{
                files: [lessSrc],
                tasks: ['less']
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default',['watch']);
};