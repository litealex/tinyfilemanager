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
                actionsUrl: '/SimpleEditor.ashx',
                templatesPrefix: '/src/templates/',
                getTemplateUrl: function (template) {
                    return this.templatesPrefix + template + '.html';
                },
                imgExtensions: ['jpg', 'gif', 'png', 'jpeg', 'bmp', 'svg'],
                extensionPrefix512: '/src/img/512px/',
                extensionPrefix32: '/src/img/32px/',
                viewType: 'list'
            });
        angular.bootstrap(holderElement, ['fm']);
    };
}(window));