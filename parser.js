const chalk = require('chalk');

const FALSE = { type: "bool", value: false };

const PRECEDENCE = {
    "=": 1,
    "||": 2,
    "&&": 3,
    "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7,
    "+": 10, "-": 10,
    "*": 20, "/": 20, "%": 20,
};

function parser(input) {
  return parse_toplevel();
  function is_punc(ch) {
    var tok = input.peek();
    return tok && tok.type == "punc" && (!ch || tok.value == ch) && tok;
  }
  function is_kw(kw) {
    var tok = input.peek();
    return tok && tok.type == "kw" && (!kw || tok.value == kw) && tok;
  }
  function is_op(op) {
    var tok = input.peek();
    return tok && tok.type == "op" && (!op || tok.value == op) && tok;
  }
  function is_var(v) {
    var tok = input.peek();
    return tok && tok.type == "var" && (!v || tok.value == v) && tok;
  }
  function is_id(id) {
    var tok = input.peek();
    return tok && tok.type == "id" && (!id || tok.value == id) && tok;
  }
  function skip_punc(ch) {
    const {value, type } = input.peek()
    if (is_punc(ch)) input.next();
    else input.croak(`Expecting punctuation: "${chalk.cyan(ch)}" not "${chalk.cyan(value)}:${type}"`);
  }
  function skip_kw(kw) {
    const {value, type } = input.peek()
    if (is_kw(kw)) input.next();
    else input.croak(`Expecting keyword: "${chalk.cyan(kw)}" not "${chalk.cyan(value)}:${type}"`);
  }
  function skip_op(op) {
    const {value, type } = input.peek()
    if (is_op(op)) input.next();
    else input.croak(`Expecting operator: "${chalk.cyan(op)}" not "${chalk.cyan(value)}:${type}"`);
  }
  function unexpected() {
    const {value, type } = input.peek()
    input.croak(`Unexpected token: "${value}:${type}"`);
  }
  function maybe_binary(left, my_prec) {
      var tok = is_op();
      if (tok) {
          var his_prec = PRECEDENCE[tok.value];
          if (his_prec > my_prec) {
              input.next();
              return maybe_binary({
                  type     : tok.value == "=" ? "assign" : "binary",
                  operator : tok.value,
                  left     : left,
                  right    : maybe_binary(parse_atom(), his_prec)
              }, my_prec);
          }
      }
      return left;
  }

  function delimited(start, stop, separator, parser) {
      var a = [], first = true;
      skip_punc(start);
      while (!input.eof()) {
          if (is_punc(stop)) break;
          if (first) first = false; else skip_punc(separator);
          if (is_punc(stop)) break;
          a.push(parser());
      }
      skip_punc(stop);
      return a;
  }
  function typedDelimited(start, stop, separator, parser) {
    const a = [];
    let count = 0;
    skip_punc(start);
    while (!input.eof()) {
      if (is_punc(stop)) break;
      if (count === 0) {
        // console.log('Identifier Argument:', chalk.green(input.peek().value) + ':' + chalk.yellow(input.peek().type))
        count++
      } else if (count === 1) {
        skip_punc(separator);
        // console.log('Variable Argument:', chalk.green(input.peek().value) + ':' + chalk.yellow(input.peek().type))
      }
      if (is_punc(stop)) break;
      a.push(parser());
    }
    skip_punc(stop);
    return a;
  }
  function parse_toplevel() {
      var schema = [];
      while (!input.eof()) {
          schema.push(parse_expression());
          if (!input.eof()) skip_punc(";");
      }
      return { type: "schema", schema };
  }

  function parse_varname() {
      var name = input.next();
      if (name.type != "var") {
        input.croak("Expecting variable name");
      }
      return name.value;
  }

  function parse_identifier() {
      var name = input.next();
      if (name.type != "id") {
        input.croak("Expecting identifier name");
      }
      return name.value;
  }

  function parse_bool() {
      return {
          type  : "bool",
          value : input.next().value == "true"
      };
  }

  function parse_atom() {
    return maybe_method(function () {

      if (is_punc("(")) {
        input.next();
        var exp = parse_expression();
        skip_punc(")");
        return exp;
      }
      if (is_kw("class")) {
        input.next()
        var ident = parse_identifier()
        skip_punc("{")
        skip_punc("}")

        return ident;
      }
      if (is_punc("{")) return parse_schema();
      if (is_kw("struct")) {
        // console.log(chalk.yellow('STRUCT', input.peek().value))
        return parse_struct();
      }
      if (is_kw("namespace")) {
        return parse_namespace();
      }
      if (is_kw("const")) {
        input.next()
        return {
          type: "member",
          identifier: input.next().value,
          label: input.next().value
        }
      }
      if (is_kw("enum")) {
        return {
          type: input.next().value,
          label: input.next().value,
          body : delimited("{", "}", ",", parse_list)
        };
      }
      if (input.peek().type == 'id' || input.peek().type == 'var') {
        return {
          type: 'member',
          identifier: input.next().value,
          label: input.next().value,
        }
      }

      var __p = input.peek()
      var tok = input.next();
      if (tok.type == "kw" || tok.type == "var" || tok.type == "num" || tok.type == "str" || tok.type == "id")
        return tok;
      // console.log('drop', tok.type, input.peek().type)
      unexpected();
    });
  }

  function parse_struct() {
    let type = input.next().value;
    let label = input.next().value;

    const hasExtension = input.peek().value === ':'
    if (!hasExtension) {
      return {
        type, label,
        body: delimited("{", "}", ";",parse_expression)
      }
    }
    skip_punc(':')
    let scope = input.next().value;
    let extending = input.next().value;
    return {
      type, label, scope, extending,
      body: delimited("{", "}", ";",parse_expression)
    };
  }

  function parse_namespace() {
    let type = input.next().value;
    let label = input.next().value;
    return {
      type, label,
      body: delimited("{", "}", ";", parse_expression)
    }
  }

  function parse_toplevel() {
      var schema = [];
      while (!input.eof()) {
        schema.push(parse_expression());
        if (!input.eof()) skip_punc(";");
      }
      return { type: "schema", schema: schema };
  }

  function parse_schema() {
      var schema = delimited("{", "}", ";", parse_expression);
      if (schema.length == 0) return FALSE;
      if (schema.length == 1) return schema[0];
      return { type: "schema", schema: schema };
  }

  function maybe_method(expr) {
    expr = expr();
    let isMethod = is_punc("(")
    if (isMethod) {
      // console.log('METHOD', expr)
    } else {
      // console.log('ATOM', expr)
    }
    return isMethod ? parse_method(expr) : expr;
  }
  function parse_parameters() {
    let param = {
      identifier: input.next().value,
      argument: input.next().value
    }
    // console.log(chalk.cyan(param.identifier), param.argument)
    return param;
  }
  function parse_method(func) {
    // console.log('->', func)
    return {
      type: "method",
      func: func ? func : input.peek(),
      params: delimited("(", ")", ",", parse_parameters)
    };
  }
  function parse_list() {
    return maybe_method(() => {
      return {
        item: input.next()
      }
    })
  }
  function parse_expression() {
    return parse_atom()
  }
}


module.exports = parser;
