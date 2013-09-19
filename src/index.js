var _ = require('lodash');
var traverse = require('ast-traverse');
var acorn = require('acorn');
var escope = require('escope');


var methods = [
  'after', 'assign', 'bind', 'bindAll', 'bindKey', 'chain', 'compact',
  'compose', 'concat', 'countBy', 'createCallback', 'curry', 'debounce',
  'defaults', 'defer', 'delay', 'difference', 'filter', 'flatten', 'forEach',
  'forEachRight', 'forIn', 'forInRight', 'forOwn', 'forOwnRight', 'functions',
  'groupBy', 'indexBy', 'initial', 'intersection', 'invert', 'invoke', 'keys',
  'map', 'max', 'memoize', 'merge', 'min', 'object', 'omit', 'once', 'pairs',
  'partial', 'partialRight', 'pick', 'pluck', 'pull', 'push', 'range',
  'reject', 'remove', 'rest', 'reverse', 'shuffle', 'slice', 'sort', 'sortBy',
  'splice', 'tap', 'throttle', 'times', 'toArray', 'transform', 'union',
  'uniq', 'unshift', 'unzip', 'values', 'where', 'without', 'wrap', 'zip',
  'clone', 'cloneDeep', 'contains', 'escape', 'every', 'find', 'findIndex',
  'findKey', 'findLast', 'findLastIndex', 'findLastKey', 'has', 'identity',
  'indexOf', 'isArguments', 'isArray', 'isBoolean', 'isDate', 'isElement',
  'isEmpty', 'isEqual', 'isFinite', 'isFunction', 'isNaN', 'isNull',
  'isNumber', 'isObject', 'isPlainObject', 'isRegExp', 'isString',
  'isUndefined', 'join', 'lastIndexOf', 'mixin', 'noConflict', 'parseInt',
  'pop', 'random', 'reduce', 'reduceRight', 'result', 'shift', 'size', 'some',
  'sortedIndex', 'runInContext', 'template', 'unescape', 'uniqueId', 'value',
  'first', 'last'
];


_.each(methods, function(name) {
  methods[name] = true;
});


function isImplicit(node, scopes) {
  return _.any(scopes, function(scope) {
    return _.any(scope.references, function(reference) {
      return reference.identifier === node && !reference.resolved;
    });
  });
}


var postOrder = {
  CallExpression: function(node) {
    var target = node.callee;
    if (target.type === 'MemberExpression' &&
        target.property.type === 'Identifier' &&
        _.has(methods, target.property.name)) {
      this.found[target.property.name] = true;
    }
  },
  MemberExpression: function(node) {
    var target = node.object;
    var key = node.property;
    if (target.type === 'Identifier' && target.name === '_' &&
        key.type === 'Identifier' && isImplicit(target, this.scopes)) {
      this.found[key.name] = true;
    }
  }
};


function inspectAst(ast) {
  var context = {
    scopes: escope.analyze(ast).scopes,
    found: {}
  };
  traverse(ast, {
    post: function(node) {
      if (node.type in postOrder) {
        postOrder[node.type].apply(context, arguments);
      }
    }
  });
  return Object.keys(context.found).sort();
}


function inspect(source) {
  return inspectAst(acorn.parse(source));
}


exports.inspect = inspect;
exports.inspectAst = inspectAst;
