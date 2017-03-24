const fs = require('fs')
const parseFile = fs.readFileSync(process.argv[2], 'utf8')

const InputStream = require('./InputStream')
const TokenStream = require('./TokenStream')
const input = InputStream(parseFile)
const tokens = TokenStream(input)

const tokenArray = []
while (tokens.peek()) {
  tokenArray.push(tokens.peek())
  tokens.next()
}
console.log(JSON.stringify(tokenArray, null, 2))
