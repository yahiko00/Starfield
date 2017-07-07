// emitterconfig.ts

const emitterConfig = 
{
	"alpha": {
		"start": 1,
		"end": 0
	},
	"scale": {
		"start": 0.05,
		"end": 0.0,
		"minimumScaleMultiplier": 1
	},
	"color": {
		"start": "#e4f9ff",
		"end": "#3fcbff"
	},
	"speed": {
		"start": 10,
		"end": 5,
		"minimumSpeedMultiplier": 1
	},
	"acceleration": {
		"x": 0,
		"y": 0
	},
	"maxSpeed": 0,
	"startRotation": {
		"min": 0,
		"max": 0
	},
	"noRotation": true,
	"rotationSpeed": {
		"min": 0,
		"max": 0
	},
	"lifetime": {
		"min": 0.5,
		"max": 1
	},
	"blendMode": "normal",
	"frequency": 0.01,
	"emitterLifetime": -1,
	"maxParticles": 500,
	"pos": {
		"x": 0,
		"y": 0
	},
	"addAtBack": false,
	"spawnType": "circle",
	"spawnCircle": {
		"x": 0,
		"y": 0,
		"r": 1
	}
};

export = emitterConfig;
