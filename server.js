var express = require('express'),
    bodyParser = require('body-parser'),
    rimraf = require('rimraf'),
    fs = require('fs'),
    app = express(),
    prefix = 'upload',
    getFoldersTree = function (prefix, tree, callback) {
        fs.readdir('./' + prefix, function (err, folders) {
            var len, i, folderName, folder;
            tree.name = prefix.split('/').pop();
            tree.folders = [];

            folders = folders.filter(function (f) {
                return fs.statSync('./' + prefix + '/' + f).isDirectory();
            });

            len = folders.length;

            if (!len) {
                callback(tree);
            }

            for (i = 0; i < len; i++) {
                folderName = folders[i];
                folder = {};
                tree.folders.push(folder);
                getFoldersTree(prefix + '/' + folderName, folder, function () {
                    i--;
                    if (i === 0) {
                        callback(tree);
                    }
                });
            }
        });
    };

app.use(express.static(__dirname));
app.use(bodyParser.json());


app.post('/files', function (req, res) {
    var body = req.body,
        vp = body.path;

    if (vp === undefined) {
        getFoldersTree(prefix, {prefix: '/'}, function (tree) {
            res.send(tree);
        });
    } else {
        switch ((body.c || '').toLowerCase()) {
            case 'createfolder':
                createFolder(vp, body.name, function () {
                    res.sendStatus(200);
                });
                break;
            case 'delfolder':
                deleteFolder(vp, body.name, function () {
                    res.sendStatus(200);
                });
                break;
            case 'del':
                deleteFiles(vp, body.files, function () {
                    res.sendStatus(200);
                });
                break;
            case 'copy':
                break;
            case 'move':
                break;
            default :
                readFiles(body.path, function (files) {
                    res.send({files: files});
                });

        }


    }

});

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

app.listen(3000, function (req, res) {

});

function createFolder(vp, name, callback) {
    console.log('22222');
    console.log(arguments);
    fs.mkdir('.' + vp + name, callback);
}

function deleteFolder(vp, name, callback) {
    rimraf('.' + vp, callback);
}

function readFiles(vp, callback) {
    fs.readdir('.' + vp, function (err, infos) {
        callback(infos.filter(function (f) {
            return !fs.statSync('./' + vp + '/' + f).isDirectory();
        }).map(function (f) {
            return {name: f};
        }))
    });
}

function deleteFiles(vp, files, callback) {
    var len = files.length,
        i;
    for (i = 0; i < len; i++) {
        fs.unlinkSync('.' + vp + '/' + files[i]);
    }
    callback();
}
