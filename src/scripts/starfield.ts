// starfield.ts

import rng = require("./rng");
import Star = require("./star");

class Starfield {
    public stars: Star[];
    constructor (
        private width: int,
        private height: int,
        private tone: float,
        public nbStars: int,
        private sizeRange: Interval,
        private starSpeed: Point) {
            this.width = width;
            this.height = height;
            this.tone = tone;
            this.nbStars = nbStars;
            this.sizeRange = sizeRange;
            this.starSpeed = starSpeed;
            this.stars = new Array(this.nbStars);

            for (let i = 0; i <= this.nbStars; i++) {
                this.stars[i] = new Star(
                    rng.irange(0, this.width),
                    rng.irange(0, this.height),
                    this.sizeRange,
                    this.tone,
                    this.starSpeed,
                    this.width,
                    this.height);
            } // for i
    } // constructor

    update() {
        for (let i = 0; i <= this.nbStars; i++) {
            this.stars[i].update();
        } // for i
    } // update
} // Starfield

export = Starfield;
