// layer.ts

import rng = require("./rng");
import Star = require("./star");

export interface LayerParams extends Star.StarParams {
    nbStars: int
} // LayerParams

export class Layer {
    public stars: Star.Star[];
    public nbStars: int;
    private starParams: Star.StarParams;
    
    constructor (private minX: double, private minY: double, private maxX: double, private maxY: double, params: LayerParams) {
        this.nbStars = params.nbStars;
        this.stars = new Array(this.nbStars);
        this.starParams = params;
        this.generate();
    } // constructor

    public generate() {
        for (let i = 0; i <= this.nbStars; i++) {
            this.stars[i] = new Star.Star(
                rng.irange(0, this.maxX - this.minX),
                rng.irange(0, this.maxY - this.minY),
                this.minX,
                this.minY,
                this.maxX,
                this.maxY,
                this.starParams);
        } // for i
    } // generate

    public update(time: double, timeRatio: double) {
        for (let i = 0; i <= this.nbStars; i++) {
            this.stars[i].update(time, timeRatio);
        } // for i
    } // update
} // Layer

export default Layer;
