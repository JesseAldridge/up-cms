const fs = require('fs')
const http = require('http')

const connect = require('connect')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt')
const mustache = require('mustache')

const port = 3000

function index_get() {
  const article_text = fs.readFileSync('articles.json', 'utf8')
  const articles = JSON.parse(article_text)

  const index_text = fs.readFileSync('index.html', 'utf8')
  return mustache.render(index_text, {article: articles})
}

function admin_get() {
  const article_text = fs.readFileSync('articles.json', 'utf8')
  const articles = JSON.parse(article_text)

  const index_text = fs.readFileSync('admin.html', 'utf8')
  return mustache.render(index_text, {article: articles})
}

function article_update(req, res) {
  const article_text = fs.readFileSync('articles.json', 'utf8')
  const articles = JSON.parse(article_text)
  const target_id = parseInt(req.body.article_id)
  for(let article of articles)
    if(article.article_id == target_id) {
      article.title = req.body.title
      article.content = req.body.content
      break
    }

  const json_out = JSON.stringify(articles, null, 2)
  fs.writeFileSync('articles.json', json_out)
  res.writeHead(302, {'Location': '/'})
  res.end()
}

function article_create(req, res) {
  const article_text = fs.readFileSync('articles.json', 'utf8')
  const articles = JSON.parse(article_text)
  articles.push({
    article_id: Math.round(Math.random() * Math.pow(10, 10)),
    title: req.body.title,
    content: req.body.content
  })

  const json_out = JSON.stringify(articles, null, 2)
  fs.writeFileSync('articles.json', json_out)
  res.writeHead(302, {'Location': '/'})
  res.end()
}

function login_post(req, res) {
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
  let response_string = ''
  let content_type = 'text/html'

  if(req.method == 'POST') {
    if(req.url == '/login')
      return login_post(req, res)
    else if(req.url == '/article-update')
      return article_update(req, res)
    else if(req.url == '/article-create')
      return article_create(req, res)
  }
  else {
    if(req.url == '/')
      response_string = index_get()
    if(req.url == '/login')
      response_string = fs.readFileSync('login.html', 'utf8')
    else if(req.url == '/admin') {
      const auth_token = req.session.auth_token
      if(auth_token && auth_token == username_to_auth_token[req.session.username])
        response_string = admin_get()
      else
        response_string = fs.readFileSync('login.html', 'utf8')
    }
    else if(req.url == '/login-form.css') {
      response_string = fs.readFileSync('login-form.css', 'utf8')
      content_type = 'text/css'
    }
    else if(req.url == '/shared.css') {
      response_string = fs.readFileSync('shared.css', 'utf8')
      content_type = 'text/css'
    }
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
