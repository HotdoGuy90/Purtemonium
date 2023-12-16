var fs = require('fs');
var http = require('http');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const path = require('path');
var { Octokit } = require('@octokit/rest');
var fetch = require('node-fetch-commonjs');

app.use(express.static(path.join(__dirname, 'views')));

const options = {
    root: path.join(__dirname, 'views')
}

app.get('/', function(req, res) {
    res.sendFile("./index.html", options);
});

app.get('/posting-rules', function(req, res) {
    res.sendFile("./posting-rules.html", options);
});

app.get('/new', function(req, res) {
    res.sendFile('./new.html', options);
});

app.get('/edit', function(req, res) {
    res.sendFile('./edit.html', options);
});

app.get('/getPosts', function(req, res){
    res.sendFile('./data.json', options);
});

app.use(bodyParser.urlencoded({ extended: true}));

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

    fs.readFile('./views/data.json', function(err, data) {
        data = JSON.parse(data);
        data.posts.push(post);

        const octokit = new Octokit({
            request: {
                fetch: fetch
            },
            auth: process.env.GITHUB_PROFILE_KEY
        });

        octokit.request('GET /repos/{owner}/{repo}/contents/views/{path}', {
            owner: 'HotdoGuy90',
            repo: 'Purtemonium',
            path: 'data.json',
            headers: {
                'X-Github-Api-Version': '2022-11-28'
            }
        }).then(res => octokit.request('PUT /repos/{owner}/{repo}/contents/views/{path}', {
            owner: 'HotdoGuy90',
            repo: 'Purtemonium',
            path: 'data.json',
            message: 'Post Was Created',
            committer: {
                name: "HotdoGuy90",
                email: "coopercjonesinfinity@gmail.com"
            },
            content: btoa(JSON.stringify(data)),
            sha: res.data.sha,
            headers: {
                'X-Github-Api-Version': '2022-11-28'
            }
        }));
    });
    res.status(200).redirect('../');
    
});

app.post('/editPost', function(req, res) {
    var title = req.body.title;
    var body = req.body.paragraph;
    var id = req.body.id;

    console.log("Editing Post!");
    console.log("It is now: ")
    console.log(title);
    console.log(body);

    fs.readFile('./views/data.json', function (err, data) {
        data = JSON.parse(data);
        data.posts[id].paragraph = body;
        data.posts[id].title = title;
        fs.writeFile('./views/data.json', JSON.stringify(data), function(err) {
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

    fs.readFile('./views/data.json', function(err, data) {
        data = JSON.parse(data);
        data.posts.splice(id, 1);
        const octokit = new Octokit({
            auth: process.env.GITHUB_PROFILE_KEY,
            request: {
                fetch: fetch
            }
        });
        
        octokit.request('GET /repos/{owner}/{repo}/contents/views/{path}', {
            owner: 'HotdoGuy90',
            repo: 'Purtemonium',
            path: 'data.json',
            headers: {
                'X-Github-Api-Version': '2022-11-28'
            }
        }).then(res => octokit.request('PUT /repos/{owner}/{repo}/contents/views/{path}', {
            owner: 'HotdoGuy90',
            repo: 'Purtemonium',
            path: 'data.json',
            message: 'Post Was Deleted',
            committer: {
                name: "HotdoGuy90",
                email: "coopercjonesinfinity@gmail.com"
            },
            content: btoa(JSON.stringify(data)),
            sha: res.data.sha,
            headers: {
                'X-Github-Api-Version': '2022-11-28'
            }
        }));
    });
    console.log("Post Successfully Deleted.");
    console.log("Post Id: " + id);
    
    res.sendStatus(200);
});

app.post('/getIdInfo', function(req, res) {
    fs.readFile('./views/data.json', function(err, data) {
        data = JSON.parse(data);
        console.log(JSON.stringify(data.posts[req.body.id]))
        res.send(JSON.stringify(data.posts[req.body.id]));
    });
});

app.use(function(req, res, next) {
    res.status(404).sendFile("./404.html", options);
});

app.listen(8080 || process.env.PORT, function(err) {
    if (err) {
        console.log(err)
    } else {
        console.log("Running Server on Port 3030.")
    }
})
