var express = require('express'),
    bodyParser = require('body-parser'),
    rimraf = require('rimraf'),
    fs = require('fs'),
    dateFormat = require('dateformat'),
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


app.post('/SimpleEditor.ashx', function (req, res) {
    var body = req.body,
        vp = req.query.virtualpath;

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
                readFiles(vp, function (files) {
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
    fs.mkdir('.' + vp + name, callback);
}

function deleteFolder(vp, name, callback) {
    rimraf('.' + vp, callback);
}

function readFiles(vp, callback) {
    fs.readdir('.' + vp, function (err, infos) {
        callback(infos.map(function (f) {
            var stat = fs.statSync('./' + vp + '/' + f);
            return {
                name: f,
                size: stat.size,
                date: dateFormat(stat.mtime, 'dd.MM.yy hh:mm:ss'),
                isFile: !stat.isDirectory()
            };
        }).filter(function (f) {
            try {
                return f.isFile;
            } finally {
                delete  f.isFile;
            }
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
