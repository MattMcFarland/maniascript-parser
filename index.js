const fs = require('fs')
const parseFile = fs.readFileSync(process.argv[2], 'utf8')

const parser = require('./parser')
const InputStream = require('./InputStream')
const TokenStream = require('./TokenStream')
const input = InputStream(parseFile)
const tokens = TokenStream(input)
const parse = parser(tokens)
console.log(parse)