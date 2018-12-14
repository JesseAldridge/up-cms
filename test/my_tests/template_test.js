const mustache = require('mustache')

const main_template_str = `
<h3>This is {{name}} {{number}}</h3>
{{#repo}}
<b>{{{.}}}</b>
<textarea style="width:100px; height: 100px;">{{{.}}}</textarea>
<input value="{{.}}">
{{/repo}}
`

const content_obj = {
  "name": "Big Tuna",
  "repo": [
    "link: <a href='foo'>\"stuff\"</a> ok",
    "hub",
    "rip"
  ],
  number: function () {
    return 2 + 4;
  }
}

console.log(mustache.render(main_template_str, content_obj))
