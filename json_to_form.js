const fs = require('fs')

const mustache = require('mustache')

json_to_form = exports.json_to_html = function(obj) {
  const html_lines = []

  for(let key of Object.keys(obj)) {
    let html = ''
    /*
      "template_name": "consulting"

      <div class="input-field">
        <div class="delete-button"></div>
        <div class="label">template name:</div>
        <input type="text" value="consulting">
      </div>
    */
    if(typeof(obj[key]) == 'string') {
      return [
        '<div class="input-field">',
        '  <div class="delete-button"></div>',
        `  <input type="text" value="${key}">`,
        '</div>'
      ]

      if(obj[key].length < 50)
        return [
          '<div class="delete-button"></div>',
          `<input type="text" value="{{${key}}}">`
        ]
      else
        return [
          '<div class="delete-button"></div>',
          `<textarea>{{{${obj[key]}}}}</textarea>`
        ]
    }
    /*
      "menu_options": [
        "Home",
        "About"
      ]

      <div class='list'>
        <div class="delete-button"></div>
        <div>menu options</div>
        {inner_html}
      </div>
    */
    else if(Array.isArray(obj[key])) {
      const div_lines = [
        '<div>',
        `  <div>${key}</div`
      ]
      for(let sub_obj of obj[key]) {
        for(let child_line of json_to_html(obj[key]))
          div_lines.push('  ' + child_line)
      }
      div_lines.push('</div>')
      return div_lines
    }
    /*
      {
        "before-image": "meeting.jpg",
        "label": "STOCK ART",
        "text": "Did someone stay stock art? Boy do we have you covered there! For mere pennies, Jesse will use cutting edge search technology to identify and obtain action-oriented imagery for your action-oriented lifestyle."
      }

      <div class='object'>
        <div class="delete-button"></div>
        {inner_html}
      </div>
    */

    else if(typeof(obj[key]) == 'object') {

    }
    else {
      console.log(`error unexpected type: ${typeof(obj)}`)
    }
    const rendered_html = mustache.render(html, obj)
    html_lines.push(rendered_html)
  }

  return html_lines.join('\n')
}

function test() {
  const json = fs.readFileSync('default-site.json')
  const obj = JSON.parse(json)
  const form_html = json_to_form(obj)
  console.log(form_html)
  console.log(form_html.length > 10)
}

if(require.main === module) {
  test()
}
