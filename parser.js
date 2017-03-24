// keywords: struct namespace public enum class 

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
  function skip_punc(ch) {
    if (is_punc(ch)) input.next();
    else input.croak("Expecting punctuation: \"" + ch + "\"");
  }
  function skip_kw(kw) {
    if (is_kw(kw)) input.next();
    else input.croak("Expecting keyword: \"" + kw + "\"");
  }
  function skip_op(op) {
    if (is_op(op)) input.next();
    else input.croak("Expecting operator: \"" + op + "\"");
  }
  function unexpected() {
    input.croak("Unexpected token: " + JSON.stringify(input.peek()));
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
    return maybe_method(function(){
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
        input.next();
        return parse_struct();
      }
      var tok = input.next();
      if (tok.type == "var" || tok.type == "num" || tok.type == "str")
        return tok;
      unexpected();
    });
  }

  function parse_struct() {
      return {
          type: "struct",
          vars: delimited("(", ")", "{", parse_schema),
          body: parse_expression()
      };
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
    return is_punc("(") ? parse_method(expr) : expr;
  }

  function parse_method(func) {
    return {
      type: "method",
      func: func,
      args: delimited("(", ")", ",", parse_expression)
    };
  }

  function parse_expression() {
    return maybe_method(function(){
      return maybe_binary(parse_atom(), 0);
    });
  }
}


module.exports = parser;
