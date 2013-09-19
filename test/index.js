global.expect = require('chai').expect;
var p = require('acorn').parse;
var inspect = require('../src');


var fixture = [
  'function noredef() {',
  '  function redef() {',
  '    var _ = {zip: true, pluck: false};',
  '    function redef2() {',
  '      return _.pluck;',
  '    }',
       // 'zip' and 'pluck' are ignored since they do not belong
       // to the global lodash object .
  '    return _.zip;',
  '  }',
  '  function noredef2() {',
       // like above, simple member access are ignored if they dont
       // belong to the global '_'
  '    return _([4, 5, 6]).filter;',
  '  }',
     // properties from the global lodash object are added
  '  return _.unzip;',
  '}',
  // here map, reduce are not accessed directly from lodash, but are included
  // since they are being called as methods
  'console.log(_([1, 2, 3]).map(function(n) {',
  '  return n * n;',
  '}).reduce(function(s, s) { return s + s; }));',
  'function test(arg1, arg2) {',
  '  return arg2.forEachRight()',
  '}'
].join('\n');

run({
  'collect': {
    "collects used lodash methods": function() {
      expect(inspect(p(fixture))).to.deep.eql([
        'forEachRight', 'map', 'reduce', 'unzip'
      ]);
    },
  }
});
