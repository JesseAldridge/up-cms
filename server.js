const fs = require('fs')
const http = require('http')

const connect = require('connect')
var bodyParser = require('body-parser')
var cookieSession = require('cookie-session')

const bcrypt = require('bcrypt')
const mustache = require('mustache')

const port = 3000

function index_get() {
  const article_text = fs.readFileSync('articles.json', 'utf8')
  const articles = JSON.parse(article_text)

  const index_text = fs.readFileSync('index.html', 'utf8')
  return mustache.render(index_text, {article: articles})
}

function login_post(req, res) {
  const saltRounds = 10

  const users_json = fs.readFileSync('users.json', 'utf8')
  const users = JSON.parse(users_json)
  const user = users[req.body.username]

  if(!user) {
    res.statusCode = 401
    res.end('user not found')
    return
  }

  bcrypt.compare(req.body.password, user.password_hash, function(err, is_match) {
    if(is_match) {
      req.session.auth_token = username_to_auth_token[req.body.username] = Math.random()
      req.session.username  = req.body.username
      res.writeHead(302, {'Location': '/admin'})
      res.end()
    }
    else {
      res.statusCode = 401
      res.end('wrong password')
    }
  });
}

const app = connect();

username_to_auth_token = {}

app.use(cookieSession({keys: ['auth_token']}));
app.use(bodyParser.urlencoded({extended: false}));

app.use(function(req, res){
  if(req.method == 'POST')
    if(req.url == '/login')
      return login_post(req, res)

  let response_string = ''
  let content_type = 'text/html'

  if(req.url == '/')
    response_string = index_get(res)
  if(req.url == '/login')
    response_string = fs.readFileSync('login.html', 'utf8')
  else if(req.url == '/admin') {
    const auth_token = req.session.auth_token
    if(auth_token && auth_token == username_to_auth_token[req.session.username])
      response_string = fs.readFileSync('admin.html', 'utf8')
    else
      response_string = fs.readFileSync('login.html', 'utf8')
  }
  else if(req.url == '/up.css') {
    response_string = fs.readFileSync('up.css', 'utf8')
    content_type = 'text/css'
  }

  if(!response_string) {
    res.statusCode = 404
    response_string = 'Page not found'
  }
  res.statusCode = ((response_string && response_string.length > 0) ? 200 : 404)
  res.setHeader('Content-Type', content_type)
  res.end(response_string)
});

http.createServer(app).listen(port);
