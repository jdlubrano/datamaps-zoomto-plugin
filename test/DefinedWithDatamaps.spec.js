// DefinedWithDatamaps.spec.js
// Author: Joel Lubrano

describe('zoomto plugin - definition', function() {
  it('should make a zoomto function available on a Datamap instance', function() {
    var dm = new Datamap({ element: document.createElement('div') });
    expect(dm.zoomto).toBeDefined();
  });
});
