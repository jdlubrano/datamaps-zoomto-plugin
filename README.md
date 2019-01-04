# Datamaps Zoom-to Plugin

[![Build Status](https://travis-ci.org/jdlubrano/datamaps-zoomto-plugin.svg?branch=master)](https://travis-ci.org/jdlubrano/datamaps-zoomto-plugin)

## Contributors
* Joel Lubrano

## Description
This project provides a plugin for zooming to arbitrary coordinates
on a D3/[Datamaps](datamaps.github.io) svg.

## Getting Started

### Git
Clone the project via `git`.  Dependencies can be installed with `yarn install`,
and running `grunt` will build the source code.  The original and minified
versions will be present in the `build` directory.

### Yarn
Run `yarn install datamaps-zoomto`.  The source will then be located in
`node_modules/datamaps-zoomto/build`.

## Sample Usage

```javascript
// Create a Datamap instance
var dm = new Datamap({
    element: document.getElementById('map')
});

// Setup the options for the zoom (defaults given)
var zoomOpts = {
    scaleFactor: 1, // The amount to zoom
    center: {
        lat: <the center of your original map>, // latitude of the point to which you wish to zoom
        lng: <the center of your orignal map>, // longitude of the point to which you wish to zoom
        // NOTE: You cannot specify lat without lng or lng without lat.  It's all or nothing.
    },
    transition: {
        duration: 1000 // milliseconds
    },
    onZoomComplete: function (zoomData) {
      // Called after zoomto completes.  Bound to the Datamaps instance.
      // Passes one argument, zoomData.
      // zoomData = {
      //   translate: { x: <number>, y: <number> },
      //   scale: <number>
      // }
      // no-op by default
    }
};

// perform the zoom
dm.zoomto(zoomOpts);

// Of course, using the default zoom will not actually zoom due to a 1:1 scale
// and the center of the map not changing.
```

Also see `examples/basic.html`.

### Using with Webpack

It is also pretty easy to use this plugin in a Webpack bundle.  See
the `webpack-example` directory for details.

```javascript
const Datamaps = require('datamaps');
require('datamaps-zoomto');

var dm = new Datamaps({
  element: document.getElementById('map')
});

dm.zoomto({
  scaleFactor: 2,
  transition: {
    duration: 1000
  }
});

// or using ES6 import syntax

import Datamaps from 'datamaps';
import zoomto from 'datamaps-zoomto';

var dm = new Datamaps({
  element: document.getElementById('map')
});

dm.addPlugin('zoomto', zoomto);

dm.zoomto({
  scaleFactor: 2,
  transition: {
    duration: 1000
  }
});
```

## Dependencies
See `package.json`.

