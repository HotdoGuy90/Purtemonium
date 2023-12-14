var fs = require('fs');
var http = require('http');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true}));

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    fs.readFile('./data.json', function(err, data) {
        res.render('index', JSON.parse(data));
    })
});

app.get('/posting-rules', function(req, res) {
    res.render('posting-rules')
});

app.get('/new', function(req, res) {
    res.render('new');
})

app.get('/edit', function(req, res) {
    res.render('edit');
})

app.post('/createPost', function(req, res) {
    var poster = req.body.username;
    var title = req.body.title;
    var body = req.body.paragraph;

    console.log("New Post!");
    console.log(title);
    console.log("By: " + poster);
    console.log(body);

    var post = {
        username: poster,
        title: title,
        paragraph: body
    }

    fs.readFile('./data.json', function(err, data) {
        data = JSON.parse(data);
        data.posts.push(post);
        fs.writeFile('./data.json', JSON.stringify(data), function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Posts Updated Successfully");
            }
        });
    });

    res.redirect('../')

    res.sendStatus(200);
    
});

app.post('/editPost', function(req, res) {
    var title = req.body.title;
    var body = req.body.paragraph;
    var id = req.body.id;

    console.log("Editing Post!");
    console.log("It is now: ")
    console.log(title);
    console.log(body);

    fs.readFile('./data.json', function (err, data) {
        data = JSON.parse(data);
        data.posts[id].paragraph = body;
        data.posts[id].title = title;
        fs.writeFile('./data.json', JSON.stringify(data), function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Post Updated Successfully");
                console.log("Post Id Edited: " + id);
            }
        });
    });
    res.redirect('../');
});

app.use(bodyParser.json())

app.post('/deletePost', function(req, res) {
    var id = req.body.id;

    fs.readFile('./data.json', function(err, data) {
        data = JSON.parse(data);
        data.posts.splice(id, 1);
        fs.writeFile('./data.json', JSON.stringify(data), function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Post Deleted Successfully");
                console.log("Post Id Deleted: " + JSON.stringify(req.body.id));
            }
        });
    });

    res.sendStatus(200);
});

app.post('/getIdInfo', function(req, res) {
    fs.readFile('./data.json', function(err, data) {
        data = JSON.parse(data);
        console.log(JSON.stringify(data.posts[req.body.id]))
        res.end(JSON.stringify(data.posts[req.body.id]));
    });
});

app.use(function(req, res, next) {
    res.status(404).render('404');
});

module.exports = app
