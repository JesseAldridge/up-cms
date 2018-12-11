const fs = require('fs')
const http = require('http')

const mustache = require('mustache')

const hostname = '127.0.0.1'
const port = 3000

function main_page() {
  const article_text = fs.readFileSync('articles.json', 'utf8')
  const articles = JSON.parse(article_text)

  const index_text = fs.readFileSync('index.html', 'utf8')
  return mustache.render(index_text, {article: articles})
}

function admin_page() {
  return 'Admin Page'
}

const server = http.createServer((req, res) => {
  let html = ''
  if(req.url == '/admin')
    html = admin_page(res)
  else
    html = main_page(res)

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html')
  res.end(html)
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})
