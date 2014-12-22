(function () {
    'use strict';
    angular.module('fm')
        .service('foldersSrv', ['$rootScope', '$http', '$q', '$templateCache', 'fmCfg', foldersSrv]);

    function foldersSrv($rootScope, $http, $q, $templateCache, fmCfg) {
        var self = this;
        this.getTemplate = function (url) {
            return $http({
                cache: $templateCache,
                url: url,
                method: 'get'
            }).then(function (res) {
                return res.data;
            })
        };
        this.getFolders = function () {
            return $http({
                url: fmCfg.foldersUrl,
                method: 'POST'
            }).then(function (res) {
                self.folders.tree = res.data;
                return res.data;
            });
        };
        /**
         * list - список файлов
         * path - текущая директория
         * pathChains - директории от рута
         * */
        this.files = {};
        this.folders = {};

        this.isMove = null;
        this.pathFrom = null;
        this.buffer = null;
        this.selectedFiles = null;

        this.loadFiles = function (path) {
            return $http({
                url: fmCfg.filesUrl,
                data: {
                    path: path
                },
                method: 'POST'
            }).then(function (res) {
                var files = self.files;
                files.list = res.data;
                files.list.forEach(function (file) {
                    file.fullPath = path + file.name;
                });
                files.path = path;
                files.pathChains = (path || '')
                    .split('/')
                    .filter(function (p) {
                        return p;
                    })
                    .map(function (p) {
                        return {
                            name: p
                        }
                    });

                $rootScope.$broadcast('fmFolderSelected');
            });
        };
        this.refreshFolder = function () {
            return this.loadFiles(this.files.path);
        };
        this.upload = function (files, progress) {
            var fd = new FormData(),
                xhr = new XMLHttpRequest();

            fd.append('path', this.files.path);
            files.forEach(function (file) {
                fd.append('files[]', file);
            });

            xhr.open('POST', fmCfg.uploadUrl);

            return $q(function (resolve, reject) {
                xhr.onload = function () {
                    resolve(xhr.responseText);
                };
                xhr.upload.onprogress = function () {
                    (progress || angular.noop).apply(this, arguments);
                    $rootScope.$apply();
                };
                xhr.onerror = reject;
                xhr.send(fd);
            });
        };
        this.changeFrame = function (frame) {
            $rootScope.$broadcast('fmChangeFrame', frame);
        };
        this.broadcast = $rootScope.$broadcast.bind($rootScope);

        this.copy = function (isMove) {
            this.isMove = isMove;
            this.pathFrom = this.files.path;
            this.buffer = this.selectedFiles
                .map(function (file) {
                    return file.name;
                });

            this.broadcast('fmCopied');
        };
        this.past = function () {
            return $http({
                url: fmCfg.actionsUrl,
                method: 'POST',
                params: {
                    c: this.isMove ? 'move' : 'copy'
                },
                data: {
                    pathFrom: this.pathFrom,
                    pathTo: this.files.path,
                    files: this.buffer
                }
            }).then(function () {
                self.isMove = null;
                self.broadcast('fmPasted');
            });
        };
        this.folderActions = function () {
            $http({});
        };

    }
}());
