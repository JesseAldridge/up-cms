const fs = require('fs')
const http = require('http')

const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const connect = require('connect')
const cookieSession = require('cookie-session')
const glob = require('glob')
const mustache = require('mustache')
const serveStatic = require('serve-static')
const expand_home_dir = require('expand-home-dir')
var shell = require('shelljs')

const PORT = (process.argv[2] ? parseInt(process.argv[2]) : 3000)
const SITES_PATH = expand_home_dir('~/winter/sites')
const DATA_PATH = expand_home_dir('~/winter')
const USERS_PATH = expand_home_dir('~/winter/email_to_user.json')

let email_to_user = {}
if(fs.existsSync(USERS_PATH)) {
  const users_json = fs.readFileSync(USERS_PATH, 'utf8')
  email_to_user = JSON.parse(users_json)
}

function get_email(req) {
  return req.body.email.toLowerCase()
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

  const rendered_html = render_page(json_path)

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html')
  res.end(rendered_html)
}

function render_page(json_path) {
  const main_json = fs.readFileSync(json_path, 'utf8')
  const main_obj = JSON.parse(main_json)

  const template_name = sanitize(main_obj.template_name || 'consulting')
  const template_html = fs.readFileSync(`page_templates/${template_name}.html`, 'utf8')
  return mustache.render(template_html, main_obj)
}

function signup_post(req, res) {
  const email = get_email(req)
  if(!email.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}/)) {
    res.statusCode = 400
    res.end('invalid email')
    return
  }

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
        if(!fs.existsSync(DATA_PATH))
          shell.mkdir('-p', DATA_PATH)
        fs.writeFileSync(USERS_PATH, users_json, 'utf8')

        reset_site(user_id)

        req.session.auth_token = user.auth_token = Math.random()
        req.session.email  = get_email(req)
        res.writeHead(302, {'Location': `/admin/${user_id}`})
        res.end()
      });
  });
}

function login_post(req, res) {
  const user = email_to_user[get_email(req)]

  if(!user) {
    res.statusCode = 401
    res.end('user not found')
    return
  }

  bcrypt.compare(req.body.password, user.password_hash, function(err, is_match) {
    if(is_match) {
      req.session.auth_token = email_to_user[get_email(req)].auth_token = Math.random()
      req.session.email = get_email(req)
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
  const ip_address = req.connection.remoteAddress
  console.log(`${new Date().toUTCString()} request from: ${ip_address}, ${req.url}`);

  let response_string = ''

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
    if(req.url == '/') {
      if(process.argv[3] == 'single-site') {
        const site_path = glob.sync(SITES_PATH + '/*.json')[0]
        if(site_path)
          response_string = render_page(site_path)
        else
          response_string = fs.readFileSync('index.html', 'utf8')
      }
      else
        response_string = fs.readFileSync('index.html', 'utf8')
    }
    else if(req.url == '/login')
      response_string = fs.readFileSync('login.html', 'utf8')
    else if(req.url == '/signup')
      response_string = fs.readFileSync('signup.html', 'utf8')
    else if(req.url == '/admin' && process.argv[3] == 'single-site') {
      const auth_token = req.session.auth_token
      const user = email_to_user[req.session.email]
      if(auth_token && user && auth_token == user.auth_token)
        response_string = admin_get(user.user_id)
      else
        response_string = fs.readFileSync('login.html', 'utf8')
    }
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
