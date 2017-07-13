// star.ts

import rng = require("./rng");
import color = require("color-ts");

export interface StarParams {
    sizeMin: float,
    sizeMax: float,
    speedX: float,
    speedY: float,
    brightSpeed: float,
    tone: string
} // StarParams

export class Star implements Point {
    public alpha: float;
    public hsl: Vec3f;
    public size: float;
    private speed: Point;
    private brightChange: float;

    constructor(
        public x: float,
        public y: float,
        private minX: float,
        private minY: float,
        private maxX: float,
        private maxY: float,
        params: StarParams) {
            this.size = rng.range(params.sizeMin, params.sizeMax);
            this.speed = { "x": params.speedX, "y": params.speedY };
            this.brightChange = params.brightSpeed * (rng.irange(0, 1) ? 1.0 : -1.0);
            this.hsl = color.rgbStringToHsl(params.tone);
            let hue = rng.gnorm(this.hsl[0] - 0.2, this.hsl[0] + 0.2);
            if (hue < 0.0) hue += 1.0;
            else if (hue > 1.0) hue -= 1.0;
            let sat = rng.gnorm(this.hsl[1] - 0.2, this.hsl[1] + 0.2);
            if (sat < 0.0) sat = 0;
            else if (sat > 1.0) sat = 1.0;
            this.hsl[2] = rng.gnorm(0.5, 1.0);
            this.alpha = 1.0;
    } // constructor

    update(time: float, timeRatio: float) {
        this.hsl[2] = 0.75 + Math.sin(time * this.brightChange) / 4.0;

        // Move and warp
        this.x += this.speed.x * timeRatio;
        this.y += this.speed.y * timeRatio;
        if (this.x < this.minX) {
            this.x = this.maxX;
        }
        if (this.x > this.maxX) {
            this.x = this.minX;
        }
        if (this.y < this.minY) {
            this.y = this.maxY;
        }
        if (this.y > this.maxY) {
            this.y = this.minY;
        }
    } // update
} // Star

export default Star;
