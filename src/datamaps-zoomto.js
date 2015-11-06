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

      datamapsSubunits().attr('data-zoomto-scale', s)
        .attr('data-zoomto-tx', t.x)
        .attr('data-zoomto-ty', t.y)
      ;

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

    var parseTranslate = function(transformStr) {
      var translateRegex = /translate\(\s*(-?\d*\.?\d*)\s*,\s*(-?\d*\.?\d*)\s*\)/gi;
      var translateResult = translateRegex.exec(transformStr);
      var t = {
        x: 0,
        y: 0
      };
      if(translateResult) {
        t.x = +translateResult[1];
        t.y = +translateResult[2];
      }
      console.log(t);
      return t;
    };

    var parseScale = function(transformStr) {
      console.log(transformStr);
      var s = { x: 1, y: 1 };
      var singleScaleRegex = /scale\(\s*(\d*\.?\d*)\s*\)/gi;
      var scaleResult = singleScaleRegex.exec(transformStr);
      if(scaleResult) {
        s.x = s.y = scaleResult[1];
      } else {
        var multiScaleRegex = /scale\(\s*(\d*\.?\d*)\s*,\s*(\d*\.?\d*)\s*\)/gi;
        scaleResult = multiScaleRegex.exec(transformStr);
        if(scaleResult) {
          s.x = scaleResult[1];
          s.y = scaleResult[2];
        }
      }
      return s;
    };

    var parseTransform = function(transformStr) {
      var transform = {
        scale: parseScale(transformStr),
        translate: parseTranslate(transformStr)
      };
      console.log(transform);
      return transform;
    };

    var resize = function() {
      if(this.options.responsive) {
        var newsize = this.options.element.clientWidth;
        var svg = d3.select(this.options.element).select('svg');
        var oldsize = svg.attr('data-width');
        var resizeScaleFactor = newsize / oldsize;
        svg.selectAll('g').attr('transform', function() {
          var sel = d3.select(this);
          var transformStr = sel.attr('transform');
          var transform = parseTransform(transformStr);
          var zoomScale = sel.attr('data-zoomto-scale');
          transform.scale.x = resizeScaleFactor * zoomScale;
          transform.scale.y = resizeScaleFactor * zoomScale;

          transformStr = genTranslateStr(
            transform.translate.x,
            transform.translate.y
          ) + genScaleStr(
            transform.scale.x,
            transform.scale.y
          );

          return transformStr;
        });
      }
    };

    // execute zoom
    console.log(self);
    self.resize = resize.bind(self);
    options = overrideProps(defaultOptions, options);
    animateZoom();
    // setTimeout(reprojectMap, options.transition.duration);
  };

  if(Datamap !== undefined) {
    // redefine resize prototype
    // Datamap.prototype.resize = function() {
    //   var self = this;
    //   if(self.options.responsive) {
    //     var newsize = self.options.element.clientWidth;
    //     var oldsize = d3.select(self.options.element).select('svg').attr('data-width');
    //     d3.select(self.options.element)
    //       .select('svg')
    //       .selectAll('g')
    //       .attr('transform', 'scale(' + (newsize / oldsize) + ')')
    //     ;
    //   }
    // };
    var dm = new Datamap({ element: document.createElement('div') });
    dm.addPlugin(PLUGIN_NAME, zoomtoPlugin);
  }

  return zoomtoPlugin;

}());
