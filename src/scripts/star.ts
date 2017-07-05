// star.ts

import rng = require("./rng");
import color = require("color-ts");

class Star implements Point {
    public alpha: float;
    public hsl: Vec3f;
    public size: float;

    private adder: float;

    constructor(
        public x: float,
        public y: float,
        sizeRange: Interval,
        tone: int,
        private speed: Point,
        private maxX: float,
        private maxY: float) {
            this.alpha = 1.0;
            this.hsl = color.rgbNumberToHsl(tone);
            let hue = rng.gnorm(this.hsl[0] - 0.2, this.hsl[0] + 0.2);
            if (hue < 0.0) hue += 1.0;
            else if (hue > 1.0) hue -= 1.0;
            let sat = rng.gnorm(this.hsl[1] - 0.2, this.hsl[1] + 0.2);
            if (sat < 0.0) sat = 0;
            else if (sat > 1.0) sat = 1.0;
            this.hsl[2] = rng.gnorm(0.5, 1.0);
            this.size = rng.range(sizeRange.min, sizeRange.max);
            this.speed = speed;
            this.adder = rng.irange(0, 1) ? 0.001 : -0.001;
    } // constructor

    update() {
        if ((this.hsl[2] <= 0.5 && this.adder < 0.0) || (this.hsl[2] >= 1.0 && this.adder > 0.0)) {
            this.adder *= -1.0;
        }
        this.hsl[2] += this.adder;

        // Move and warp
        this.x += this.speed.x;
        this.y += this.speed.y;
        if (this.x < 0.0) {
            this.x = this.maxX;
        }
        if (this.x > this.maxX) {
            this.x = 0.0;
        }
        if (this.y < 0.0) {
            this.y = this.maxY;
        }
        if (this.y > this.maxY) {
            this.y = 0.0;
        }
    } // update
} // Star

export = Star;
