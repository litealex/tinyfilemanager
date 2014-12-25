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
                actionsUrl: '/files',
                templatesPrefix: '/src/templates/',
                imgExtensions: ['jpg', 'gif', 'png', 'jpeg', 'bmp', 'svg'],
                extensionPrefix: '/src/img/512px/'
            });
        angular.bootstrap(holderElement, ['fm']);
    };
}(window));