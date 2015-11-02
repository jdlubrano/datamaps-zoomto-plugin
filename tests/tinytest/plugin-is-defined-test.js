// plugin-is-defined-test.js
// Author: Joel Lubrano

Tinytest.add('Datamap instances have a zoomto method defined', function(test) {
  test.isNotUndefined(Datamap);
  var dm = new Datamap({ element: document.createElement('div') });
  test.isNotUndefined(dm.zoomto);
});

