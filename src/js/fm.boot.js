/**
 * Created by alex on 20.12.14.
 */
(function (w) {
    w.fileManager = function (holderElement, editor, cfg) {
        angular.module('fm')
            .factory('editor', function () {
                return editor;
            })
            .value('fmCfg', {
                foldersUrl: '/folders',
                filesUrl: '/files',
                uploadUrl: '/files?c=upload',
                actionsUrl: '/files',
                templatesPrefix: '/src/templates/'
            });
        angular.bootstrap(holderElement, ['fm']);
    };
}(window));