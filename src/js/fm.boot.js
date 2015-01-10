/**
 * Created by alex on 20.12.14.
 */
(function (w) {
    w.fileManager = function (holderElement, editor, cfg, path) {
        var $holderElement = $(holderElement);
        angular.module('fm')
            .factory('editor', function () {
                return editor;
            })
            .value('fmCfg', {
                actionsUrl: path + '/SimpleEditor.ashx',
                templatesPrefix: path + '/src/templates/',
                getTemplateUrl: function (template) {
                    return this.templatesPrefix + template + '.html';
                },
                imgExtensions: ['jpg', 'gif', 'png', 'jpeg', 'bmp', 'svg'],
                extensionPrefix512: path + '/src/img/512px/',
                extensionPrefix32: path + '/src/img/32px/',
                viewType: 'list'
            });
        angular.bootstrap(holderElement, ['fm']);
        $holderElement
            .on('hide.bs.modal', function () {
                $holderElement
                    .scope()
                    .$broadcast('fmDialogClose');

            });
    };
}(window));