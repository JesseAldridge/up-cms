const fs = require('fs')
const http = require('http')

const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const connect = require('connect')
const cookieSession = require('cookie-session')
const mustache = require('mustache')
const serveStatic = require('serve-static')
const expand_home_dir = require('expand-home-dir')
var shell = require('shelljs')

const PORT = (process.argv[2] ? parseInt(process.argv[2]) : 3000)
const SITES_PATH = expand_home_dir('~/winter/sites')

let email_to_user = {}
if(fs.existsSync('email_to_user.json')) {
  const users_json = fs.readFileSync('email_to_user.json', 'utf8')
  email_to_user = JSON.parse(users_json)
}

function site_get(req, res, next) {
  const match = /\/([a-zA-Z0-9\-_]+$)/.exec(req.url)
  if(!match || !match[1]) {
    next()
    return
  }

  const site_id = match[1]
  const json_path = `${SITES_PATH}/${site_id}.json`
  if(!fs.existsSync(json_path)) {
    next()
    return
  }

  const main_text = fs.readFileSync(json_path, 'utf8')
  const main_obj = JSON.parse(main_text)

  const template_name = sanitize(main_obj.template_name || 'consulting')
  const template_html = fs.readFileSync(`page_templates/${template_name}.html`, 'utf8')
  const rendered_html = mustache.render(template_html, main_obj)

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html')
  res.end(rendered_html)
}

function signup_post(req, res) {
  const email = req.body.email

  if(email_to_user[email]) {
    login_post(req, res)
    return
  }

  const saltRounds = 10;
  bcrypt.genSalt(saltRounds, function(err, salt) {
      bcrypt.hash(req.body.password, salt, function(err, password_hash) {
        const user_id = Math.round(Math.random() * Math.pow(10, 10))

        const user = email_to_user[email] = {
          email: email,
          salt: salt,
          password_hash: password_hash,
          user_id: user_id
        }

        const users_json = JSON.stringify(email_to_user, null, 2)
        fs.writeFileSync('email_to_user.json', users_json, 'utf8')

        reset_site(user_id)

        req.session.auth_token = user.auth_token = Math.random()
        req.session.email  = req.body.email
        res.writeHead(302, {'Location': `/admin/${user_id}`})
        res.end()
      });
  });
}

function login_post(req, res) {
  const user = email_to_user[req.body.email]

  if(!user) {
    res.statusCode = 401
    res.end('user not found')
    return
  }

  bcrypt.compare(req.body.password, user.password_hash, function(err, is_match) {
    if(is_match) {
      req.session.auth_token = email_to_user[req.body.email].auth_token = Math.random()
      req.session.email = req.body.email
      res.writeHead(302, {'Location': `/admin/${user.user_id}`})
      res.end()
    }
    else {
      res.statusCode = 401
      res.end('wrong password')
    }
  });
}

function admin_get(user_id) {
  const path = `${SITES_PATH}/${user_id}.json`
  let site_json = ''
  if(fs.existsSync(path))
    site_json = fs.readFileSync(path, 'utf8')
  const admin_text = fs.readFileSync('admin.html', 'utf8')
  return mustache.render(admin_text, {site_json: site_json, user_id: user_id})
}

function sanitize(filename) {
  // http://gavinmiller.io/2016/creating-a-secure-sanitization-function/
  // Bad as defined by wikipedia: https://en.wikipedia.org/wiki/Filename#Reserved_characters_and_words
  // Also have to escape the backslash

  // TODO: test this more

  const bad_chars = [ '/', /\\/, /\?/, '%', /\*/, ':', /\|/, '"', '<', '>', /\./, ' ' ]
  for(let bad_char of bad_chars)
    filename = filename.replace(new RegExp(bad_char, 'g'), '_')
  return filename
}

const app = connect();

app.use(cookieSession({keys: ['auth_token']}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(function(req, res, next){
  let response_string = ''

  console.log('url:', req.url)

  if(req.method == 'POST') {
    if(req.url == '/login')
      return signup_post(req, res)
    else if(req.url == '/site-update')
      return site_update(req, res)
    else if(req.url.match(/^\/reset\/[0-9]+$/)) {
      const auth_token = req.session.auth_token
      const user = email_to_user[req.session.email]
      if(auth_token && user && auth_token == user.auth_token) {
        reset_site(user.user_id)

        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain')
        res.end('ok')
      }
      else {
        res.statusCode = 401
        res.end('unauthorized')
      }
      return
    }
    else if(req.url.match(/^\/admin\/[0-9]+$/)) {
      const auth_token = req.session.auth_token
      const user = email_to_user[req.session.email]
      if(auth_token && user && auth_token == user.auth_token) {
        if(!fs.existsSync(SITES_PATH))
          shell.mkdir('-p', SITES_PATH)
        fs.writeFileSync(`${SITES_PATH}/${user.user_id}.json`, JSON.stringify(req.body, null, 2))

        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain')
        res.end('ok')
      }
      else {
        res.statusCode = 401
        res.end('unauthorized')
      }
      return
    }
  }
  else {
    if(req.url == '/')
      response_string = fs.readFileSync('index.html', 'utf8')
    else if(req.url == '/login')
      response_string = fs.readFileSync('login.html', 'utf8')
    else if(req.url == '/signup')
      response_string = fs.readFileSync('signup.html', 'utf8')
    else if(req.url.match(/^\/admin\/[0-9]+$/)) {
      const auth_token = req.session.auth_token
      const user = email_to_user[req.session.email]
      if(auth_token && user && auth_token == user.auth_token)
        response_string = admin_get(user.user_id)
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
    return
  }

  res.statusCode = 404
  res.setHeader('Content-Type', 'text/html')
  res.end('Page not found')
})

app.use(site_get)

function reset_site(user_id) {
  if(!fs.existsSync(SITES_PATH))
    shell.mkdir('-p', SITES_PATH);
  fs.copyFileSync('default-site.json', `${SITES_PATH}/${user_id}.json`);
}

const static = serveStatic('public')
app.use(function(req, res, next) {
  static(req, res, next)
})

http.createServer(app).listen(PORT)
console.log(`listening on ${PORT}`)
