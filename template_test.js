const mustache = require('mustache')

const main_template_str = `
<h3>This is {{name}} {{number}}</h3>
{{#repo}}
<b>{{.}}</b>
{{/repo}}
`

const content_obj = {
  "name": "Big Tuna",
  "repo": [
    "resque",
    "hub",
    "rip"
  ],
  number: function () {
    return 2 + 4;
  }
}

console.log(mustache.render(main_template_str, content_obj))
