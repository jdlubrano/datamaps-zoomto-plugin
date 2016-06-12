# Datamaps Zoom-to Plugin

## Contributors
* Joel Lubrano

## Description
This project provides a plugin for zooming to arbitrary coordinates
on a D3/[Datamaps](datamaps.github.io) svg.

## Getting Started

### Git
Clone the project via `git`.  Dependencies can be installed with `npm install`,
and running `grunt` will build the source code.  The original and minified
versions will be present in the `build` directory.

### NPM
Run `npm install datamaps-zoomto`.  The source will then be located in
`node_modules/datamaps-zoomto/build`.

## Sample Usage
```
// Create a Datamap instance
var dm = new Datamap({
    element: document.getElementById('map')
});

// Setup the options for the zoom (defaults given)
var zoomOpts = {
    scaleFactor: 1, // The amount to zoom
    center: {
        lat: 0, // latitude of the point to which you wish to zoom
        lng: 0, // longitude of the point to which you wish to zoom
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
// and a (0,0) center.

```

Also see `examples/basic.html`.

## Dependencies
See `package.json`.

