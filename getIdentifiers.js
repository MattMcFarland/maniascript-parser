module.exports = function () {
  const fs = require('fs')
  const parseFile = fs.readFileSync('./doc.h', 'utf8')
  const scrubbed = parseFile.replace(/\/\*\![\s]*\*\//g, '').replace(/  /g, '')
  const statements = scrubbed.split('};')
  let current = 0
  let things = [];
  let identifiers = [];  
  while (current < statements.length) {
    let statement = statements[current].trim()
    const thing = {}

    if (statement.indexOf('/*!') !== -1 && statement.indexOf('*/') !== -1) {
      let commentable = statement;
      thing.comment = commentable.split('*/')[0].trim()
      statement =  commentable.split('*/')[1].trim()
    }

    let labels = statement.split(' ');
    let body = statement
    thing.body = body;
    if (labels[0] === 'class') {
      thing.type = 'Type'
      thing.label = labels[1].split('{}')[0]
      identifiers.push(thing.label.split('{')[0].trim())
    }
    if (labels[0] === 'struct') {   
      thing.type = 'Class'    
      thing.label = labels[1]
      identifiers.push(thing.label)
      if (labels[2] === ':') {      
        thing.extends = labels[4]
      }    
    }
    if (labels[0] === 'namespace') {   
      thing.type = 'Class'    
      thing.label = labels[1]
      identifiers.push(thing.label)
      if (labels[2] === ':') {      
        thing.extends = labels[4]
      }    
    }        
    current++;
  }  
  return identifiers;
}

