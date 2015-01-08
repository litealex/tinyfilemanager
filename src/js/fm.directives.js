/**
 * Created by alex on 20.12.14.
 */
(function () {
    'use strict';
    angular.module('fm')
        .directive('fmFoldersTree', ['$compile', '$parse', 'foldersSrv', fmFoldersTree])
        .directive('stopEvent', [stopEvent])
        .directive('fmDropFiles', ['$parse', '$compile', fmDropFiles])
        .directive('fmProgress', ['fmCfg', fmProgress])
        .directive('fmFile', ['fmCfg', fmFile])
        .directive('fmDialog', ['$compile', 'foldersSrv', fmDialog])
        .directive('fmFileExt', ['fmCfg', fmFileExt])
        .directive('fmUploadFile', ['$parse', fmUploadFile]);

    function fmFoldersTree($compile, $parse, foldersSrv) {
        return {
            scope: true,
            link: function (scope, element, attrs) {
                var selectedPath = null;
                scope.level = (scope.level || 0) + 1;
                scope.isHide = false;

                if (scope.level === 1) {

                    scope.load = function (path) {
                        $parse(attrs.fmFoldersPath).assign(scope.$parent, path);
                    };

                    scope.isSelected = function (path) {
                        return path === selectedPath;
                    };

                    scope.$watch(attrs.fmFoldersPath, function (p) {
                        selectedPath = p;
                    });
                }

                scope.toggleCollapse = function () {
                    scope.isHide = !scope.isHide;
                };

                scope.$watch(attrs.fmFoldersTree, function (folder) {
                    if (!folder) return;
                    if (scope.prefix === undefined) {
                        scope.prefix = folder.prefix || '/';
                    }

                    scope.folder = folder;
                    if (scope.level === 1) {
                        scope.$fullPath = scope.prefix + folder.name + '/';
                    } else {
                        scope.$fullPath = scope.$fullPath + folder.name + '/';
                    }

                    folder.fullPath = scope.$fullPath;

                    if (folder.selected) {
                        scope.load(folder.fullPath);
                    }

                });

                foldersSrv
                    .getTemplate('fmFoldersTree')
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
        return {
            scope: true,
            link: function (scope, element, attrs) {


                element.on('dragover', function () {
                    element
                        .on('dragleave', function () {

                        });
                    return false;
                }).on('drop', function (e) {
                    e.preventDefault();
                    scope.$files = Array.prototype.slice.call(e.originalEvent.dataTransfer.files);
                    scope.$apply(function () {
                        $parse(attrs.fmDropFiles)(scope);
                    });
                });

                scope.$on('fmEndUploading', function () {
                });
            }
        };
    }

    function fmProgress(fmCfg) {
        return {
            scope: true,
            templateUrl: fmCfg.getTemplateUrl('fmProgress'),
            link: function (scope, element, attrs) {
                scope.$on(attrs.fmProgress, function (e, val) {
                    if (typeof val === 'number') {
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
            prefix = fmCfg.extensionPrefix512;
        return {
            scope: true,
            templateUrl: fmCfg.getTemplateUrl('fmFile'),
            link: function (scope, element, attrs) {
                var file = attrs.fmFile,
                    ext = (file.split('.').pop() || '').toLowerCase();

                if (imgExtensions.indexOf(ext) == -1) {
                    scope.file = prefix + ext + '.png';
                    element.find('img').on('error', function () {
                        this.src = prefix + '_blank.png';
                    });
                } else {
                    scope.file = attrs.fmFilePrefix + file;
                }
            }
        };
    }

    function fmDialog($compile, foldersSrv) {
        return {
            scope: true,
            link: function (scope, element, attrs) {
                var isVisible = false,
                    $template = $('<div class="fm-dialog"></div>'),
                    parentOffseet = null;
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
                        foldersSrv
                            .getTemplate(attrs.fmDialog)
                            .then(function (template) {
                                if (!parentOffseet) {
                                    parentOffseet = {left: 0, top: 0};
                                    var parent = element;
                                    while (parent = parent.parent()) {
                                        var offset = parent.offset();
                                        if (!offset) break;
                                        parentOffseet.left += offset.left;
                                        parentOffseet.top += offset.top;
                                    }

                                }
                                $template.html($compile(template)(scope)).css(element.offset());
                                $('body').prepend($template).removeClass('modal-open');
                                isVisible = true;
                            });
                    }
                    $template.on('submit', function () {
                        scope.close();
                    });
                });
            }
        };
    }

    function fmFileExt(fmCfg) {
        var prefix = fmCfg.extensionPrefix32;
        return {
            link: function (scope, element, attrs) {
                var ext = (attrs.fmFileExt.split('.').pop() || '')
                    .toLowerCase();
                element.attr('src', prefix + ext + '.png');
                element.on('error', function () {
                    this.src = prefix + '_blank.png';
                });
            }
        };
    }

    function fmUploadFile($parse) {
        var $file = angular.element('<input style="display: none" multiple="multiple" type="file"/>'),
            $body = angular.element('body');
        return {
            scope: true,
            link: function (scope, element, attrs) {
                $body.append($file);
                $file.on('change', function (e) {
                    scope.$files = Array.prototype.slice.call(this.files);
                    scope.$apply(function () {
                        $parse(attrs.fmUploadFile)(scope);
                    });
                });
                element.on('click', function () {
                    $file.click();
                });
            }
        }
    }
}());