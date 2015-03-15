/**
 * Created by alex on 20.12.14.
 */
(function () {
    'use strict';
    angular.module('fm')
        .controller('FoldersController', ['$scope', 'foldersSrv', FoldersController])
        .controller('FilesController', ['$scope', 'filterFilter', 'foldersSrv', FilesController])
        .controller('MenuController', ['$scope', 'foldersSrv', MenuController])
        .controller('InsertController', ['$scope', 'foldersSrv', InsertController])
        .controller('UploadController', ['$scope', 'foldersSrv', UploadController]);

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
            foldersSrv.broadcast('fmChangePath', path);
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

        $scope.showUploadForm = function () {
            foldersSrv.changeFrame('upload');
        };

        $scope.removeFiles = function () {
            foldersSrv.removeFiles()
                .then(function () {
                    foldersSrv.refreshFolder();
                    foldersSrv.broadcast('fmDialogClose');
                });
        };

        $scope.removeFolder = function () {
            foldersSrv
                .folderActions('delfolder')
                .then(function () {
                    var chains = foldersSrv.files.pathChains;
                    chains.pop();
                    foldersSrv.broadcast('fmChangePath',
                        '/' + chains.map(function (f) {
                            return f.name;
                        }).join('/') + '/');
                    foldersSrv.broadcast('fmDialogClose');
                });
        };

        $scope.createFolder = function (name) {
            foldersSrv
                .folderActions('createfolder', name)
                .then(function () {
                    foldersSrv.broadcast('fmChangePath',
                        foldersSrv.files.path + name + '/').refreshFolder();
                });

        };

        $scope.copyFiles = function () {
            foldersSrv.copy();
        };

        $scope.moveFiles = function () {
            foldersSrv.copy(true);
        };

        $scope.pastFiles = function () {
            foldersSrv.past().then(function () {
                foldersSrv.refreshFolder();
            });
        };

        $scope.type = foldersSrv.getViewType();

        $scope.setView = function (type) {
            $scope.type = type;
            foldersSrv.setViewType(type);
        };

        $scope.refresh = function () {
            foldersSrv.refreshFolder();
            foldersSrv.getFolders();
        };


    }

    function InsertController($scope, foldersSrv) {
        $scope.$on('fmFilesSelect', function (event, count) {
            $scope.filesSelectedCount = count;
        });

        $scope.insert = function () {
            $scope.$emit('fmInsertFiles', foldersSrv.selectedFiles.map(function (file) {
                return file.fullPath;
            }));
        };
    }

    function UploadController($scope, foldersSrv) {
        $scope.files = [];
        $scope.addToList = function (files) {
            $scope.files = $scope.files.concat(files);
        };

        $scope.upload = function (files) {
            $scope.uploading = true;
            foldersSrv.upload(files, function (event) {
                $scope.$broadcast('fmUploading', event.loaded / event.total * 100);
            }).then(function () {
                foldersSrv.refreshFolder().then(function () {
                    $scope.uploading = false;
                    $scope.close();
                });
            });
        };

        $scope.remove = function (i) {
            $scope.files.splice(i, 1);
        };
    }


}());