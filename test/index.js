const fs = require('fs')
const path = require('path')

fs.readFile(path.join(__dirname,'./doc.h'), 'utf8', (err, data) => {
  if (err) throw err
  console.log('initialize processer')
  const parser = require('../parser')
  const InputStream = require('../InputStream')
  const TokenStream = require('../TokenStream')
  const getIdentifiers = require('../getIdentifiers')
   console.log('get identifiers')
  const identifiers = getIdentifiers(data).join(' ') 
  const input = InputStream(data)
  console.log('get input')
  const tokens = TokenStream(input, identifiers)
  console.log('get tokens')
  const readTokens = []
  while(tokens.peek()) {
    readTokens.push(tokens.next())    
  }
  console.log(JSON.stringify(readTokens, null, 2))

})

