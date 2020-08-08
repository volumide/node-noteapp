const url = require('url');
const fs = require('fs')
const path = require('path')


exports.createNote = function (req, res) {
    body = '';
    req.on('data',(chunk) => {
        body += chunk;
    });
    req.on('end', function () {
        postBody = JSON.parse(body);
        let response = {
            "category": postBody.category,
            "filename":  postBody.file,
			"note": postBody.note
        };
        let checkcat = CheckCatgoryExists(response.category)
        if (!checkcat) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                'status': 'fail',
                'message': "choose an existing category or create a new category"
            }));
            return
        }
        fs.writeFile(`notes/${response.category}/${response.filename}.txt`, `${response.note}`, (err) =>{
            if (!err) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    'status': 'success',
                    'message': "successfuly created",
                    response
                }));
                return
            }
            res.statusCode = 203;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                'message': err
            }));

        })
    });
};

exports.removeNote = function(req, res){
    res.setHeader('Content-Type', 'application/json')
    const reqUrl = url.parse(req.url, true)
    if (!reqUrl.query.cat || !reqUrl.query.text) {
        res.end(JSON.stringify({
            'message':'invalid query passed'
        }))
        return 
    }
    fs.unlink(`notes/${reqUrl.query.cat}/${reqUrl.query.text}.txt`, err=>{
        if(!err){
            fs.readdir(`notes/${reqUrl.query.cat}`, (err, files)=>{
                console.log(files.length)
                if(files.length < 1){
                    fs.rmdir(`notes/${reqUrl.query.cat}`, err=>{
                        if(!err){
                            console.log('success')
                        }else{
                            console.log `${err}`
                        }
                    })
                }
            })
            res.statusCode = 200
                res.end(JSON.stringify({
                    'status': 'success',
                    'message': 'deleted successfully',
                }))
                return
            }
        res.statusCode = 404
        res.end(JSON.stringify({
            'status': 'fail',
            'message': 'file does not exist', 
            'err': err
        }))
    })
}

exports.createNewCategory = function(req, res){
    body = '';
    req.on('data',(chunk) => {
        body += chunk;
    });

    req.on('end', ()=>{
        postBody = JSON.parse(body)
        let dir = {
            'category': postBody.category
        }
        let check = CheckCatgoryExists(dir.category)
        if (check) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                'status': 'fail',
                'message': "category already exists"
            }));
            return
        }
        fs.mkdir(`notes/${dir.category}`, err =>{
            if (!err) {
                res.statusCode = 200
                res.end(JSON.stringify({
                    'status': 'success',
                    'message': "category created successfully",
                }));
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    'status': 'fail',
                    'message': err,
                }));
            }
        })
    })

    // req.on('end', ()=>{
    //     postBody = JSON.parse(body)
    //     let data = {
    //         'category': postBody.category
    //     }
    //     let checkcat = CheckCatgoryExists(`${data.category}`)
    //     if (!checkcat) {
    //         res.statusCode = 401;
    //         res.setHeader('Content-Type', 'application/json');
    //         res.end(JSON.stringify({
    //             'status': 'fail',
    //             'message': "category already exists"
    //         }));
    //         return
    //     }
    //     fs.mkdir(`notes/${data.category}`, (err)=>{
    //     	if (!err) {
    //     		res.statusCode = 200;
    //             res.setHeader('Content-Type', 'application/json');
    //             res.end(JSON.stringify({
    //                 'status': 'success',
    //                 'message': "category created successfully",
    //             }));
    //             console.log('creates')
    //             return
    //         }
    //         console.log('fail')
    //         res.statusCode = 409;
    //         res.setHeader('Content-Type', 'application/json');
    //         res.end(JSON.stringify({
    //             'status': 'fail',
    //             'message': "category already exists",
    //         }));
           
    //     })
    // })
}

exports.readFiles = function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    const reqUrl = url.parse(req.url, true)

    if (!reqUrl.query.cat || !reqUrl.query.text) {
        res.end(JSON.stringify({
            'message':'invalid query passed'
        }))
        return 
    }
    let text = reqUrl.query.text
    let cat = reqUrl.query.cat

    fs.readFile(`notes/${cat}/${text}.txt`, (err, data)=>{
        if (!err) {
            res.statusCode = 200
            res.end(JSON.stringify({
                'status': 'success',
                'note': data.toString(),
                'path': path.dirname(`notes/${cat}/${text}.txt`)
            }))
            return
        }
        res.statusCode = 404
        res.end(JSON.stringify({
            'status': 'fail',
            'message': 'file does not exist', 
            'err': err
        }))
    })
}

exports.readAllDir = function(req, res){
    const reqUrl = url.parse(req.url, true)
    let dir = './notes'
    let allDir = []
    let sortedDir = []
    if (reqUrl.query.dir) {
        dir = dir + '/' + reqUrl.query.dir
    }
    fs.readdir(dir, (err, files)=>{
        if(!err){
            files.forEach((file, index) =>{
                allDir.push({
                    'id': index + 1,
                    'dir': file
                })
            })
            if (reqUrl.query.dir) {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({
                    'status': 'success',
                    'data' : allDir
                }))
                return
            }
            allDir.forEach((file, index) => {
                sortedDir.push({
                    'id': index + 1,
                    'dir': file.dir
                })
            })
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
                'status': 'success',
                'data' : sortedDir
            }))
        }
    })
}

exports.invalidRequest = function (req, res) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Invalid Request');
};

function CheckCatgoryExists(dir){
    if (fs.existsSync(`./notes/${dir}`)) {
        return true
    }
    return false
}
