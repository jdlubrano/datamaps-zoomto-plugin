// DefinedWithDatamapsSpec.js
// Author: Joel Lubrano

describe('zoomto plugin - definition', function() {

  var DatamapFactory = function() {};

  DatamapFactory.create = function() {
    return new Datamap({ element: document.createElement('div') });
  };

  it('should make a zoomto function available on a Datamap instance', function() {
    var dm = DatamapFactory.create();
    expect(dm.zoomto).toBeDefined();
  });

});

