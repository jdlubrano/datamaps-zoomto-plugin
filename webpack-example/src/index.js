var Datamaps = require('datamaps');
var zoomto = require('datamaps-zoomto');

var dm = new Datamaps({
  // scope: 'usa',
  element: document.getElementById('map')
});

var zoomInOpts = {
  scaleFactor: 2,
  center: {
    lat: 45,
    lng: -90
  },
  transition: {
    duration: 1000
  }
};

var zoomOutOpts = {
  scaleFactor: 0.5,
  center: {
    lat: 40,
    lng: -90
  },
  transition: {
    duration: 1000
  }
};

function zoomToCenter() {
  dm.zoomto({
    scaleFactor: 2,
    transition: {
      duration: 1000
    }
  });
}

window.zoomToCenter = zoomToCenter;
