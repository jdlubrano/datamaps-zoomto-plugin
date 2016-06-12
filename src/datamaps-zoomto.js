// datamaps-zoomto.js
// Author: Joel Lubrano

"use strict";

(function() {
  var PLUGIN_NAME = "zoomto";

  var zoomtoPlugin = function(layer, options) {
    var self = this;

    if(self.resizeScaleFactor === undefined) {
      self.resizeScaleFactor = 1;
    }

    var defaultOptions = {
      scaleFactor: 1, // no scale
      center: {
        lat: 0,
        lng: 0
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

      var centerCoordsXY = self.latLngToXY(options.center.lat, options.center.lng);

      // Assume that the old center will be at the center of the svg element
      var oldCenterCoordsXY = [
        self.options.element.offsetWidth / 2,
        self.options.element.offsetHeight / 2
      ];

      var s = options.scaleFactor * calculateResizeFactor();

      // Calculate the overall desired translation accounting for scale.
      // All we need to do is move from the old center point to the new
      // center point and multiply by the scaling factor.
      var t = {
        x: oldCenterCoordsXY[0] - s * (centerCoordsXY[0]),
        y: oldCenterCoordsXY[1] - s * (centerCoordsXY[1])
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

  if(Datamap !== undefined) {
    var dm = new Datamap({ element: document.createElement('div') });
    dm.addPlugin(PLUGIN_NAME, zoomtoPlugin);
  }

  return zoomtoPlugin;

}());
