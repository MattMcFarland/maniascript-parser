module.exports = function (parseFile) {
  const fs = require('fs')
  const scrubbed = parseFile.replace(/\/\*\![\s]*\*\//g, '').replace(/  /g, '')
  const statements = scrubbed.split('};')
  const identifiers = statements.reduce((acc, body) => {
    const statement = body.replace(/\s/g, ' ').replace(/{|\:|public/g, ' ');
    const labels = statement.trim().split(' ')
    const type = labels[0].trim();
    const name = labels[1] ? labels[1].trim(): undefined
    if (!name) return acc;
    acc.push(name)
    return acc;
  }, [])
  console.log(identifiers)
  return identifiers;
}
