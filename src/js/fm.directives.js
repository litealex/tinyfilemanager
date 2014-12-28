/**
 * Created by alex on 20.12.14.
 */
(function () {
    'use strict';
    angular.module('fm')
        .directive('fmFile', ['fmCfg', fmFile])
        .directive('fmDialog', ['$compile', '$http', 'fmCfg', fmDialog])
        .directive('fmProgress', ['fmCfg', fmProgress])
        .directive('fmDropFiles', ['$parse', '$compile', fmDropFiles])
        .directive('stopEvent', [stopEvent])
        .directive('fmFoldersTree',
        ['$compile', '$parse', 'fmCfg', 'foldersSrv', fmFoldersTree]);

    function fmFoldersTree($compile, $parse, fmCfg, foldersSrv) {
        var tempalteUrl = fmCfg.templatesPrefix + 'fmFoldersTree.html',
            selectedFolder = null;
        return {
            scope: true,
            link: function (scope, element, attrs) {
                scope.level = (scope.level || 0) + 1;
                scope.isHide = false; //scope.level < 2;

                scope.toggleCollapse = function () {
                    scope.isHide = !scope.isHide;
                };
                scope.load = function () {
                    selectedFolder = scope.folder.fullPath;
                    $parse(scope._loadFn)(scope);
                };
                scope.isSelected = function () {
                    return scope.folder.fullPath === selectedFolder;
                };

                scope.$watch(attrs.fmFoldersTree, function (folder) {
                    if (!folder) return;
                    if (scope.prefix === undefined) {
                        scope.prefix = folder.prefix || '/';
                    }

                    scope.folder = folder;
                    if (scope.level === 1) {
                        scope.$path = scope.prefix + folder.name + '/';
                        scope._loadFn = attrs.fmFoldersLoad;
                    } else {
                        scope.$path = scope.$path + folder.name + '/';
                    }

                    folder.fullPath = scope.$path;
                    if (folder.selected) {
                        scope.load();
                    }

                });

                foldersSrv
                    .getTemplate(tempalteUrl)
                    .then(function (template) {
                        element.append($compile(template)(scope));
                    });
            }
        };
    }

    function stopEvent() {
        return function (scope, element, attrs) {
            element.on(attrs.stopEvent, function (e) {
                e.stopPropagation();
            });
        };
    }

    function fmDropFiles($parse, $compile) {
        var $template = angular.element('<div class="upload bg-info">' +
        '<i class="glyphicon glyphicon-upload"></i>' +
        '<div fm-progress="fmUploading"></div>' +
        '</div>');
        return {
            scope: true,
            link: function (scope, element, attrs) {
                var isOver = false,
                    leave = function () {
                        if (isOver) {
                            $template.remove();
                            isOver = false;
                        }
                        return false;
                    };
                $compile($template)(scope);

                element.on('dragover', function () {
                    if (!isOver) {
                        var css = {
                            width: element.width(),
                            height: element[0].scrollHeight
                        };
                        element.append($template.css(css)
                            .on('dragleave', leave));
                        isOver = true;
                    }
                    return false;
                }).on('drop', function (e) {
                    e.preventDefault();
                    scope.$files = Array.prototype.slice.call(e.originalEvent.dataTransfer.files);
                    scope.$apply(function () {
                        $parse(attrs.fmDropFiles)(scope);
                    });
                });

                scope.$on('fmEndUploading', leave);
            }
        };
    }


    function fmProgress(fmCfg) {
        return {
            scope: true,
            templateUrl: fmCfg.templatesPrefix + 'fmProgress.html',
            link: function (scope, element, attrs) {
                scope.$on(attrs.fmProgress, function (e, val) {
                    if (typeof  val === 'number') {
                        scope.visible = true;
                        scope.progress = val.toFixed(2);
                    } else {
                        scope.visible = false;
                    }

                });
            }
        };
    }

    function fmFile(fmCfg) {
        var imgExtensions = fmCfg.imgExtensions,
            prefix = fmCfg.extensionPrefix;
        return {
            scope: true,
            templateUrl: fmCfg.templatesPrefix + 'fmFile.html',
            link: function (scope, element, attrs) {
                var file = attrs.fmFile,
                    ext = (file.split('.').pop() || '').toLowerCase();

                if (imgExtensions.indexOf(ext) == -1) {
                    scope.file = prefix + ext + '.png';
                } else {
                    scope.file = attrs.fmFilePrefix + file;
                }
            }
        };
    }

    function fmDialog($compile) {
        return {
            scope: true,
            link: function (scope, element, attrs) {
                var isVisible = false,
                    $template;
                scope.close = function () {
                    if ($template) {
                        $template.remove();
                    }
                    isVisible = false;
                };

                element.on('click', function () {
                    if (isVisible) {
                        scope.close();
                    } else {
                        $template = $compile('<div class="fm-dialog">' +
                        $(attrs.fmDialog).html() +
                        '</div>')(scope).css(element.offset());
                        element.after($template).removeClass('modal-open');
                        isVisible = true;
                    }
                    $template.on('submit', function () {
                        scope.close();
                    });
                });
            }
        };
    }
}());