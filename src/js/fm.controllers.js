/**
 * Created by alex on 20.12.14.
 */
(function () {
    'use strict';
    angular.module('fm')
        .controller('InsertController', ['$scope', 'editor', 'foldersSrv', InsertController])
        .controller('LayoutController', ['$scope', LayoutController])
        .controller('UploadController', ['$scope', 'foldersSrv', UploadController])
        .controller('MenuController', ['$scope', 'foldersSrv', MenuController])
        .controller('FilesController', ['$scope', 'filterFilter', 'foldersSrv', FilesController])
        .controller('FoldersController', ['$scope', 'foldersSrv', FoldersController]);

    function FoldersController($scope, foldersSrv) {
        foldersSrv.getFolders()
            .then(function (folders) {
                $scope.folders = folders;
                folders.selected = true;
            });

        $scope.loadFiles = function (path) {
            foldersSrv
                .loadFiles(path)
                .then(function () {
                    foldersSrv.changeFrame('files');
                });
        };

    }

    function FilesController($scope, filterFilter, foldersSrv) {
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
            var prefix = $scope.folders.tree.prefix;
            var path = prefix + '/' + $scope.files
                .pathChains
                .map(function (f) { return f.name; })
                .slice(0, index+1)
                .join('/');

            console.log(path);

            for (var i = 0; i <= index;i++)
            
            foldersSrv
                .loadFiles(path);
        };
    }

    function MenuController($scope, foldersSrv) {
        $scope.$on('fmFolderSelected', function () {
            $scope.isFolderSelected = true;
        });
        $scope.$on('fmFilesSelect', function (event, count) {
            $scope.filesSelectedCount = count;
        });
        $scope.$on('fmCopied', function () {
            $scope.isCopied = true
        });
        $scope.$on('fmPasted', function () {
            $scope.isCopied = false;
        });

        $scope.showUploadForm = function () {
            foldersSrv.changeFrame('upload');
        };

        $scope.removeFiles = function () {
            foldersSrv.removeFiles();
        };

        $scope.removeFolder = function () {

        };

        $scope.createFolder = function () {

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

    function UploadController($scope, foldersSrv) {
        $scope.upload = function (files) {
            foldersSrv.upload(files, function (event) {
                $scope.$broadcast('fmUploading', event.loaded / event.total * 100);
            }).then(function () {
                foldersSrv.refreshFolder().then(function () {
                    foldersSrv.changeFrame('files');
                });
            });
        };
    }

    function LayoutController($scope) {
        $scope.$frame = 'files';
        $scope.$on('fmChangeFrame', function (event, frame) {
            $scope.$frame = frame;
        });
    }

    function InsertController($scope, editor, foldersSrv) {
        $scope.$on('fmFilesSelect', function (event, count) {
            $scope.filesSelectedCount = count;
        });

        $scope.insert = function () {
            var imgs = [];
            foldersSrv.selectedFiles.forEach(function (file) {
                imgs.push('<img src="' + file.fullPath
                + '" alt="' + file.name + '"/>')
            });

            editor.insertContent(imgs.join(''));
        };
    }

}());