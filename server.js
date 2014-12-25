var express = require('express'),
    bodyParser = require('body-parser'),
    app = express();

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.post('/files', function (req, res) {
    var vp = req.body.virtualpath,
        raw = 'Dropdowns are automatically positioned via CSS within the normal flow of the document. This means dropdowns may be cropped by parents with certain overflow properties or appear out of bounds of the viewport. Address these issues on your own as they arise.',
        files = raw.split(' ').map(function (file) {
            return {
                name: file + '.mp3',
                size: file.length
            }
        }),
        folders = [
            {
                name: 'Img',
                folders: [{
                    name: 'animal',
                    folders: []
                }, {
                    name: 'birds',
                    folders: []
                }, {
                    name: 'cities',
                    folders: [
                        {name: 'Moscow', folders: []},
                        {name: 'Omsk', folders: []},
                        {name: 'Krasnodar', folders: []}
                    ]
                }]
            },
            {
                name: 'child2',
                folders: [{
                    name: 'child 2.1',
                    folders: []
                }, {
                    name: 'child 2.2',
                    folders: [
                        {
                            name: 'child2.2.1',
                            folders: []
                        }
                    ]
                }]
            }

        ];


    if (vp === undefined) {
        return res.send({
            name: 'Root',
            prefix: '',
            folders: folders
        });
    }

    res.send({files: files});
});

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

app.listen(3000, function (req, res) {

});