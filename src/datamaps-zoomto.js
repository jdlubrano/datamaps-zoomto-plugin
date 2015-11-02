// datamaps-zoomto.js
// Author: Joel Lubrano

"use strict";

(function() {
  var PLUGIN_NAME = "zoomto";
  
  var zoomtoPlugin = function(layer, options) {
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

    var selection = function() {
      return d3.select(self.options.element);
    };

    var datamapsSubunits = function() {
      return selection().select('.datamaps-subunits');
    };

    var datamapsHoverover = function() {
      return selection().select('.datamaps-hoverover');
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

    /**
     * Apply a d3 transition to animate a zoom effect.
     */
    var animateZoom = function() {
      if(options.scaleFactor < 0) {
        throw Error('Cannot zoom to a negative scale');
      }
      
      var centerCoordsXY = self.latLngToXY(options.center.lat, options.center.lng);
 
      // Assume that the old center will be at the center of the svg element
      var oldCenterCoordsXY = [
        self.options.element.offsetWidth / 2,
        self.options.element.offsetHeight / 2
      ];

      var s = options.scaleFactor;

      // Calculate the overall desired translation accounting for scale.
      // All we need to do is move from the old center point to the new
      // center point and multiply by the scaling factor.
      var t = {
        x: oldCenterCoordsXY[0] - s * (centerCoordsXY[0]),
        y: oldCenterCoordsXY[1] - s * (centerCoordsXY[1])
      };

      var transformStr = genTranslateStr(t.x, t.y) + ' ' + genScaleStr(s);

      datamapsSubunits().transition()
        .duration(options.transition.duration)
        .attr('transform', transformStr)
      ;
    };

    /**
     * Redrawing the projection will allow other plugins to stay in sync
     * with the Datamaps utility functions such as latLngToXY.  All we
     * want to do is redraw the projection with the proper scale and translation
     * such that the user never sees the map being replaced.
     */
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
      // TODO: handle rapid zooming (i.e. someone keeps clicking the zoom
      // button before the animation completes).
      // Maybe we just put the burden on the developer using the plugin.
      // NOTE: self.options is the Datamap's options object not the options
      // parameter for this plugin.
      self.options.setProjection = genProjection;
      // Scale the map border lines otherwise they get too big or too small
      self.options.geographyConfig.borderWidth *= options.scaleFactor;
      // Remove elements that will be redrawn to avoid polluting the DOM.
      datamapsSubunits().remove();
      datamapsHoverover().remove();
      self.draw();
    };

    // execute zoom
    options = overrideProps(defaultOptions, options);
    animateZoom();
    setTimeout(reprojectMap, options.transition.duration);
  };

  if(Datamap !== undefined) {
    var dm = new Datamap({ element: document.createElement('div') });
    dm.addPlugin(PLUGIN_NAME, zoomtoPlugin);
  }

  return zoomtoPlugin;

}());
