var _ = require('lodash');
var traverse = require('ast-traverse');
var acorn = require('acorn');
var escope = require('escope');


// thanks @akre54(https://github.com/tarruda/lodash-inspect/issues/1) for this trick
var methods = _.functions(_);

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


module.exports = function(ast) {
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
};
