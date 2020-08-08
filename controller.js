const http = require('http');
const url = require('url');

module.exports = http.createServer((req, res) => {
    var service = require('./service');
    const reqUrl = url.parse(req.url, true);

	// create new row
	if (reqUrl.pathname == '/new/note' && req.method === 'POST') {
		service.createNote(req, res)
		return
	}

	// delete note
	if (reqUrl.pathname == '/delete/note' && req.method === 'DELETE') {
		service.removeNote(req, res)
		return
	}
	
	// create category
	if (reqUrl.pathname == '/new/category' && req.method === 'POST') {
		service.createNewCategory(req, res)
		return
	}

	// update Note
	if (reqUrl.pathname == '/update/note' && req.method === 'PUT') {
		service.createNote(req, res)
		return
	}

	// read directory
	if (reqUrl.pathname == '/get/directory' && req.method === 'GET') {
		service.readAllDir(req, res)
		return
	}

	// readNote
	if (reqUrl.pathname == '/read/note' && req.method === 'GET') {
		service.readFiles(req, res)
		return
	}
	// service.invalidRequest(req, res)

});

