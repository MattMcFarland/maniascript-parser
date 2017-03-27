function transform(ast) {
  const mapping = ast.schema.reduce(processSchema, {})
  return makeCompletions(mapping)
}

function processSchema(items, item) {
  switch (item.type) {
    case "class":
      items.primitives = items.primitives || [];
      items.primitives.push(item.label);
      return items;
    case "struct":
    case "namespace":
      items.classes = items.classes || {};
      items.classes[item.label] = {
        extends: item.extending,
        props: item.body.reduce(processProps, {}),
        methods: item.body.reduce(processMethods, {})
      }
      return items;
    default:
      console.warn('ignoring', item.type, item.label)
      return items;
  }
}

function processProps(members, {type, identifier, label}) {
  if (type !== 'member') {
    return members;
  }

  if (!identifier) {
    console.log('no identifier for', label)
    return members;
  }

  members[identifier] = members[identifier] || [];
  members[identifier].push(label)

  return members;
}

function processMethods(methods, {type, body}) {
  if (type !== 'method') {
    return methods;
  }

  const { label, params, identifier} = body
  if (!identifier) {
    console.log('no identifier for', label)
    return methods;
  }

  methods[label] = {
    params,
    returns: identifier
  }

  return methods;
}

function makeClassCompletions(classes) {

  function classReducer(acc, className) {
    const current = classes[className];
    const extObj = current.extends ? Object.assign({}, classes[current.extends], current) : {}
    const updateObj = {}

    if (!isEmpty(extObj.props)) {
      updateObj.props = Object.assign({}, extObj.props)
    }
    if (!isEmpty(extObj.methods)) {
      updateObj.methods = Object.assign({}, extObj.methods)
    }
    if (!isEmpty(updateObj)) {
      acc[className] = updateObj;
    }
    return acc;
  }
  return Object.keys(classes).reduce(classReducer, {})

}

function makeCompletions(mapping) {
  return {
    primitives: mapping.primitives,
    classes: makeClassCompletions(mapping.classes)
  }
}

function isEmpty(obj) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object
}

module.exports = transform