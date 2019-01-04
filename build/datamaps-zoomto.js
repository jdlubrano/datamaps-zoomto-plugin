// datamaps-zoomto.js
// Author: Joel Lubrano

"use strict";

(function() {
  var PLUGIN_NAME = "zoomto";

  function isDefined(val) {
    return val !== null && val !== undefined;
  }

  var zoomtoPlugin = function(layer, options) {
    var self = this;

    if(self.resizeScaleFactor === undefined) {
      self.resizeScaleFactor = 1;
    }

    var defaultOptions = {
      scaleFactor: 1, // no scale
      center: {
        lat: null,
        lng: null
      },
      transition: {
        duration: 1000
      },
      onZoomComplete: function() {}
    };

    var selection = function() {
      return d3.select(self.options.element);
    };

    var datamapsSubunits = function() {
      // return selection().select('.datamaps-subunits');
      return selection().selectAll('svg>g');
    };

    var datamapsHoverover = function() {
      return selection().select('.datamaps-hoverover');
    };

    var genTranslateStr = function(x, y) {
      return 'translate(' + x + ',' + y + ')';
    };

    var genScaleStr = function(x, y) {
      if(y === undefined) y = x;
      return 'scale(' + x + ',' + y + ')';
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

    var calculateResizeFactor = function() {
      var newsize = self.options.element.clientWidth;
      var svg = d3.select(self.options.element).select('svg');
      var oldsize = svg.attr('data-width');
      return newsize / oldsize;
    };

    /**
     * Apply a d3 transition to animate a zoom effect.
     */
    var animateZoom = function(duration) {
      if(options.scaleFactor < 0) {
        throw Error('Cannot zoom to a negative scale');
      }

      // Assume that the old center will be at the center of the svg element
      var oldCenterCoords = {
        x: self.options.element.offsetWidth / 2,
        y: self.options.element.offsetHeight / 2
      };

      var centerCoords = {
        x: oldCenterCoords.x,
        y: oldCenterCoords.y
      };

      if (isDefined(options.center.lng) && isDefined(options.center.lng)) {
        var coords = self.latLngToXY(options.center.lat, options.center.lng);

        if (coords === null) {
          throw new Error(
            'The latitude/longitude coordinates that you tried to use as your' +
            ' center are outside the bounds of your projection (your map).'
          );
        }

        centerCoords.x = coords[0];
        centerCoords.y = coords[1];
      }

      var s = options.scaleFactor * calculateResizeFactor();

      // Calculate the overall desired translation accounting for scale.
      // All we need to do is move from the old center point to the new
      // center point and multiply by the scaling factor.
      var t = {
        x: oldCenterCoords.x - s * (centerCoords.x),
        y: oldCenterCoords.y - s * (centerCoords.y)
      };

      var transformStr = genTranslateStr(t.x, t.y) + genScaleStr(s);

      datamapsSubunits().transition()
        .duration(duration)
        .attr('transform', transformStr)
      ;

      options.onZoomComplete.call(self, {
        translate: t,
        scale: s
      });
    };

    var resize = function() {
      if(this.options.responsive) {
        animateZoom(0);
      }
    };

    self.resize = resize.bind(self);

    options = overrideProps(defaultOptions, options);

    // execute zoom
    animateZoom(options.transition.duration);
  };

  if (typeof exports === 'object') {
    var Datamap = require('datamaps');

    var dm = new Datamap({ element: document.createElement('div') });
    dm.addPlugin(PLUGIN_NAME, zoomtoPlugin);

    module.exports = zoomtoPlugin;
  } else {
    if (typeof window.Datamap === 'undefined') {
      throw new Error('The Datamaps library is required before you can use the zoomto plugin.');
    }

    dm = new window.Datamap({ element: document.createElement('div') });
    dm.addPlugin(PLUGIN_NAME, zoomtoPlugin);
  }

  return zoomtoPlugin;
}());
