(function () {
    'use strict';
    angular.module('fm')
        .service('foldersSrv', ['$rootScope', '$http',
            '$q', '$templateCache', 'fmCfg', FoldersSrv]);

    function FoldersSrv($rootScope, $http, $q, $templateCache, fmCfg) {
        var self = this;
        this.getTemplateUrl = function (template) {
            return fmCfg.getTemplateUrl(template);
        };
        this.getTemplate = function (template) {
            var result = $http({
                cache: $templateCache,
                url: fmCfg.getTemplateUrl(template),
                method: 'get'
            }).then(function (res) {
                return res.data;
            });

            return result;
        };
        this.getVeiwTemplateUrl = function () {
            return fmCfg.getTemplateUrl('fmFiles' + fmCfg.viewType);
        };
        this.getViewType = function () {
            return fmCfg.viewType;
        };
        this.setViewType = function (type) {
            fmCfg.viewType = type;
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

        this.getFolders = function () {
            return $http({
                url: fmCfg.actionsUrl,
                method: 'POST'
            }).then(function (res) {
                self.folders.tree = res.data;
                return self.folders;
            });
        };
        this.loadFiles = function (path) {
            return $http({
                url: fmCfg.actionsUrl,
                params: {
                    virtualpath: path
                },
                method: 'POST'
            }).then(function (res) {
                var files = self.files;
                files.list = res.data.files;

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
                        };
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

            fd.append('virtualpath', this.files.path);
            fd.append('c', 'upload');
            files.forEach(function (file) {
                fd.append('files[]', file);
            });

            xhr.open('POST', fmCfg.actionsUrl);

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
        this.copy = function (isMove) {
            this.isMove = isMove;
            this.pathFrom = this.files.path;
            this.buffer = toSimpleArray(this.selectedFiles);

            this.broadcast('fmCopied');
        };
        this.past = function () {
            return $http({
                url: fmCfg.actionsUrl,
                method: 'POST',
                params: {
                    c: this.isMove ? 'move' : 'copy',
                    virtualpath: this.files.path,
                    addInfo: JSON.stringify({
                        files: this.buffer,
                        from: this.pathFrom
                    })
                }
            }).then(function () {
                self.isMove = null;
                self.broadcast('fmPasted');
            });
        };
        this.removeFiles = function () {
            return $http({
                url: fmCfg.actionsUrl,
                method: 'POST',
                params: {
                    c: 'del',
                    virtualpath: this.files.path,
                    addInfo: JSON.stringify(toSimpleArray(this.selectedFiles))
                }
            });
        };
        this.folderActions = function (action, name) {
            return $http({
                url: fmCfg.actionsUrl,
                method: 'POST',
                params: {
                    virtualpath: this.files.path + (name||''),
                    c: action
                }
            }).then(function () {
                self.getFolders();
            });
        };

        this.broadcast = $rootScope.$broadcast.bind($rootScope);
    }

    function toSimpleArray(files) {
        return files.map(function (item) {
            return item.name;
        });
    }

}());
