// datamaps-zoomto.js
// Author: Joel Lubrano

"use strict";

(function() {
  var PLUGIN_NAME = "zoomto";
  
  var zoomtoPlugin = function(layer, data, options) {
    var self = this;

    var defaultOptions = {
      scaleFactor: 1, // no scale
      center: {
        lat: 0,
        lng: 0
      },
      transition: {
        duration: 1000
      }
    };

    var doingAnimation = false;
    var timeout = null;
    var transform = null;

    var datamapsSubunits = function() {
      return d3.select('.datamaps-subunits');
    };
    
    var genTranslateStr = function(x, y) {
      return 'translate(' + x + ',' + y + ')';
    };

    var genScaleStr = function(scaleFactor) {
      return 'scale(' + scaleFactor + ')';
    };
    
    var overrideProps = function(orig, addition) {
      // add the properties from orig that 
      // do not already exist in addition.
      for(var prop in orig) {
        if(typeof orig[prop] === "object" && addition[prop]) {
          overrideProps(orig[prop], addition[prop]);
        } else {
          if(addition[prop] == null) addition[prop] = orig[prop];
        }
      }
      return addition;
    };

    var animateZoom = function() {
      if(options.scaleFactor < 0) {
        throw Error('Cannot zoom to a negative scale');
      }
      
      var centerCoordsXY = self.latLngToXY.apply(
        self,
        [options.center.lat, options.center.lng]
      );

      // self.projection.center() returns [lng, lat] but we need [lat, lng].
      // Hence the reverse call
      
      var oldCenterCoordsXY = [
        self.options.element.offsetWidth / 2,
        self.options.element.offsetHeight / 2
      ];

      // Calculate the XY translation for changing the center point
      var c = {
        x: oldCenterCoordsXY[0] - centerCoordsXY[0],
        y: oldCenterCoordsXY[1] - centerCoordsXY[1]
      };

      // Retrieve the map's current translation
      var t = {
        x: self.projection.translate()[0],
        y: self.projection.translate()[1]
      };

      var s = options.scaleFactor;

      // Calculate the overall desired translation accounting for scale
      transform = {
        x: oldCenterCoordsXY[0] - s * (centerCoordsXY[0]),
        y: oldCenterCoordsXY[1] - s * (centerCoordsXY[1])
      };

      var transformStr = genTranslateStr(transform.x, transform.y) + ' ' + genScaleStr(s);

      datamapsSubunits().transition()
        .duration(options.transition.duration)
        .attr('transform', transformStr)
      ;
    };

    var genProjection = function(element) {
      var s = options.scaleFactor;
      var projection = self.projection;
      var translate = projection.translate();
      var centerXY = self.latLngToXY(options.center.lat, options.center.lng);
      var t = {
        x: (element.offsetWidth / 2) + s * (translate[0] - centerXY[0]),
        y: (element.offsetHeight / 2) + s * (translate[1] - centerXY[1])
      };

      var scale = projection.scale() * s;
      var proj = projection.translate([t.x, t.y]).scale(scale);
      var path = d3.geo.path().projection(proj);

      return { path: path, projection: proj };
    };

    var reprojectMap = function() {
      // handle rapid zooming
      if(doingAnimation) {
        clearTimeout(timeout);
      }
      // NOTE: self.options is the Datamap's options object not the options
      // parameter for this plugin.
      self.options.setProjection = genProjection;
      // Scale the map border lines otherwise they get too big or too small
      self.options.geographyConfig.borderWidth *= options.scaleFactor;
      datamapsSubunits().remove();
      self.draw();
      var c = self.projection.invert([400, 225]);
      console.log(c);

    };

    // execute zoom
    // d3.select(layer).remove();
    options = overrideProps(defaultOptions, options);
    doingAnimation = true;
    animateZoom();
    doingAnimation = false;
    timeout = setTimeout(reprojectMap, options.transition.duration);
    // reprojectMap();
  };

  if(Datamap !== undefined) {
    var dm = new Datamap({ element: document.createElement('div') });
    dm.addPlugin(PLUGIN_NAME, zoomtoPlugin);
  }

  return zoomtoPlugin;

}());

