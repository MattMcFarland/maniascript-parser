const fs = require('fs')
const path = require('path')
const { Spinner } = require('cli-spinner')
const artifactPath = path.join(__dirname)
Spinner.setDefaultSpinnerString(3)
spinner = new Spinner('Loading.... %s');
spinner.start()
fs.readFile(path.join(__dirname, './doc.h'), 'utf8', (err, _data) => {
  const data = _data.replace(/\(reserved\),[\s]/, '')
  if (err) throw err
  spinner.setSpinnerTitle('Parsing.... %s')
  const parser = require('../parser')
  const InputStream = require('../InputStream')
  const TokenStream = require('../TokenStream')
  const getIdentifiers = require('../getIdentifiers')
  const identifiers = getIdentifiers(data).join(' ')
  const _input = InputStream(data)
  const input = InputStream(data)
  const _rtokens = TokenStream(_input, identifiers)
  const readTokens = []
  spinner.setSpinnerTitle(`tokenize... %s`)
  while (_rtokens.peek()) {
    let current = _rtokens.next()
    readTokens.push(current)
  }
  try {
    spinner.setSpinnerTitle(`tokens.json... %s`)
    fs.writeFileSync(artifactPath + '/tokens.json', JSON.stringify(readTokens, null, 2));
    spinner.setSpinnerTitle(`parse... %s`)
    const ast = parser(TokenStream(input, identifiers))
    spinner.setSpinnerTitle(`ast.json... %s`)
    fs.writeFileSync(artifactPath + '/ast.json', JSON.stringify(ast, null, 2));
    setTimeout(() => spinner.stop(), 1000)
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
})

