# Starfield Generator #

Procedural generated 2D starfield using WebGL.

## Overview ##

![Starfield overview](https://raw.githubusercontent.com/yahiko00/yahiko00.github.io/master/images/starfield20170713b.gif)

**[Online Demonstration](http://yahiko.developpez.com/apps/Starfield/)**


## Main features ##

* Three-layer star field.
* Star positions follow a uniform distribution.
* Star colorization based on HSL and Gaussian distribution around the given star field's tone.
* Anti-aliasing.
* Blur effect.
* Bloom effect.
* Comet generated with a particle system.
* Nebulae background generated with simplex noise.
* GUI to change parameters.

Your browser and GPU have to support WebGL to make this star field generator works. Old Intel HD Graphics may not render all effects.


## Installation ##

The TypeScript compiler and TSLint should be installed globally.

	$> git clone https://github.com/yahiko00/Starfield.git
	$> cd Starfield
	$> npm install


## Build ##

Project settings are defined in `package.json`, `settings` section. Inside this section, set `debug` to `true` to debug the project with source maps, or set `debug` to `false` to build the project in the release mode.

Tasks are defined in the `gulpfile.js` script.

Commands should be run under a **bash** shell.

The following command builds the project, run unit tests, and opens the browser. If any change happens, it builds the project again and refreshes the browser.

	$> npm run watchRefresh

For more predefined commands, see `package.json`, item `scripts`.

Unit tests are logged in the `tests/` folder, file `tape.log`.

## Contributors ##

yahiko


## Licence ##

MIT
