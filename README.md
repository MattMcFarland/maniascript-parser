# ManiaScript Parser
Currently experimental, and born out of necessity to create a better parsing system with intellisense and other great language
features we know in love in the development world.

## Features

* doc.h parsing
* tokenization (lexing)
* AST (Abstract Syntax Tree) Generation of the C++ header file
* Made with <3 using Javascript

## Usage

This application currently will build the `doc.h` file into `ast.json` and `tokens.json` - which may be used with further research and development.
Because this is in an *experimental* phase right now, the current state is volatile, but the [built files](./test) are already available should you be interested in reviewing without the need to build anything.

```
npm install
node test
```

After running `node test` the `doc.h` file will be parsed.

---

## Using your own docs

You can build your own doc.h files by following the instructions found in ManiaPlanets Documentation.

## Further usage

This is also capable of parsing `C++` header files, but not all features are available because it has been created

## Acknowledgements

THIS amazing guide really helped me learn how to create this: http://lisperator.net/pltut/

## License
MIT
