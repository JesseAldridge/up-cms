const fs = require('fs')
const http = require('http')

const connect = require('connect')
const mustache = require('mustache')
var serveStatic = require('serve-static')

const port = 3000

function index_get() {
  const main_text = fs.readFileSync('main.json', 'utf8')
  const main_obj = JSON.parse(main_text)

  const index_text = fs.readFileSync('index.html', 'utf8')
  return mustache.render(index_text, main_obj)
}

const app = connect();

const static = serveStatic('public')

app.use(function(req, res, next){
  let response_string = ''

  if(req.url == '/')
    response_string = index_get()
  else if(req.url == '/login')
    response_string = fs.readFileSync('login.html', 'utf8')
  else if(req.url == '/admin') {
    const auth_token = req.session.auth_token
    if(auth_token && auth_token == username_to_auth_token[req.session.username])
      response_string = admin_get()
    else
      response_string = fs.readFileSync('login.html', 'utf8')
  }
  else {
    next()
    return
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html')
  res.end(response_string)
})

app.use(function(req, res, next) {
  static(req, res, next)
})

http.createServer(app).listen(port)
