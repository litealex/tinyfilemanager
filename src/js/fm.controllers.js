/**
 * Created by alex on 20.12.14.
 */
(function () {
    'use strict';
    angular.module('fm')
        .controller('FoldersController', ['$scope', 'foldersSrv', FoldersController])
        .controller('FilesController', ['$scope', 'filterFilter', 'foldersSrv', FilesController])
        .controller('MenuController', ['$scope', 'foldersSrv', MenuController])
        .controller('InsertController', ['$scope', 'editor', 'foldersSrv', InsertController]);

    function FoldersController($scope, foldersSrv) {
        foldersSrv.getFolders()
            .then(function (folders) {
                $scope.folders = folders;
                folders.tree.selected = true;
            });

        $scope.$watch('path', function (path) {
            if (!path) return;
            foldersSrv
                .loadFiles(path)
                .then(function () {
                    foldersSrv.changeFrame('files');
                });
        });

        $scope.$on('fmChangePath', function (e, p) {
            $scope.path = p;
        });
    }

    function FilesController($scope, filterFilter, foldersSrv) {
        $scope.getViewTemplate = function () {
            return foldersSrv.getVeiwTemplateUrl();
        };

        $scope.folders = foldersSrv.folders;
        $scope.files = foldersSrv.files;
        $scope.$watch('files', function (files) {
            if (!files.list) {
                return;
            }

            foldersSrv.selectedFiles = filterFilter(files.list, {selected: true});

            foldersSrv.broadcast('fmFilesSelect',
                foldersSrv.selectedFiles.length);
        }, true);
        $scope.loadFiles = function (index) {
            var prefix = $scope.folders.tree.prefix,
                path = (prefix === '/' ? '' : prefix) +
                    '/' + $scope.files
                        .pathChains
                        .map(function (f) {
                            return f.name;
                        })
                        .slice(0, index + 1)
                        .join('/') + '/';
                foldersSrv.broadcast('fmChangePath', path)
        };

        $scope.upload = function (files) {
            foldersSrv.upload(files, function (event) {
                $scope.$broadcast('fmUploading', event.loaded / event.total * 100);
            }).then(function () {
                foldersSrv.refreshFolder().then(function () {
                    $scope.$broadcast('fmEndUploading');
                });
            });
        };
    }

    function MenuController($scope, foldersSrv) {
        $scope.menuUrl = foldersSrv.getTemplateUrl('fmMenu');
        $scope.$on('fmFolderSelected', function () {
            $scope.isFolderSelected = true;
        });
        $scope.$on('fmFilesSelect', function (event, count) {
            $scope.filesSelectedCount = count;
        });
        $scope.$on('fmCopied', function () {
            $scope.isCopied = true;
        });
        $scope.$on('fmPasted', function () {
            $scope.isCopied = false;
        });

        $scope.type = foldersSrv.getViewType();

        $scope.setView = function (type) {
            $scope.type = type;
            foldersSrv.setViewType(type);
        };

        $scope.showUploadForm = function () {
            foldersSrv.changeFrame('upload');
        };

        $scope.removeFiles = function () {
            foldersSrv.removeFiles();
        };

        $scope.removeFolder = function () {
            foldersSrv
                .folderActions('delfolder');
        };

        $scope.createFolder = function (name) {
            foldersSrv
                .folderActions('createfolder', name);

        };

        $scope.copyFiles = function () {
            foldersSrv.copy();
        };

        $scope.moveFiles = function () {
            foldersSrv.copy(true);
        };

        $scope.pastFiles = function () {
            foldersSrv.past();
        };
    }

    function InsertController($scope, editor, foldersSrv) {
        $scope.$on('fmFilesSelect', function (event, count) {
            $scope.filesSelectedCount = count;
        });

        $scope.insert = function () {
            var imgs = [];
            foldersSrv.selectedFiles.forEach(function (file) {
                imgs.push('<img src="' + file.fullPath +
                '" alt="' + file.name + '"/>');
            });

            editor.insertContent(imgs.join(''));
        };
    }

}());