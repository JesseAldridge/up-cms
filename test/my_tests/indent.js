function nested_to_indented(list) {
  // convert nested list to flat list with indented strings

  if(typeof(list) == 'string')
    return list
  const lines = []
  for(let child of list)
    if(typeof(child) == 'string')
      lines.push(child)
    else {
      const child_lines = nested_to_indented(child)
      for(let child_line of child_lines)
        lines.push('  ' + child_line)
    }
  return lines
}

function main() {
  const list = [
    'a',
    [
      'b',
      'c',
      [
        'd',
        'e'
      ],
      'f'
    ],
    'g'
  ]
  console.log(nested_to_indented(list, 0).join('\n'))
  /*
  a
    b
    c
      d
      e
    f
  g
  */

  console.log(nested_to_indented('abc'))
}
main()
