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
                foldersUrl: '/SimpleEditor.ashx',
                filesUrl: '/SimpleEditor.ashx',
                uploadUrl: '/SimpleEditor.ashx?c=upload&',
                actionsUrl: '/SimpleEditor.ashx',
                templatesPrefix: '/src/templates/'
            });
        angular.bootstrap(holderElement, ['fm']);
    };
}(window));