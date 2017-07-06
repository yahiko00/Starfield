// starfield.ts

import rng = require("./rng");
import Star = require("./star");

namespace Starfield {
    export interface StarfieldParams extends Star.StarParams {
        nbStars: int
    } // StarfieldParams

    export class Starfield {
        public stars: Star.Star[];
        public nbStars: int;
        private starParams: Star.StarParams;
        
        constructor (private width: int, private height: int, params: StarfieldParams) {
            this.width = width;
            this.height = height;
            this.nbStars = params.nbStars;
            this.stars = new Array(this.nbStars);
            this.starParams = params;
            this.generate();
        } // constructor

        public generate() {
            for (let i = 0; i <= this.nbStars; i++) {
                this.stars[i] = new Star.Star(
                    rng.irange(0, this.width),
                    rng.irange(0, this.height),
                    this.width,
                    this.height,
                    this.starParams);
            } // for i
        } // generate

        public update() {
            for (let i = 0; i <= this.nbStars; i++) {
                this.stars[i].update();
            } // for i
        } // update
    } // Starfield
} // Starfield

export = Starfield;
