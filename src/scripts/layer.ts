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
    
    constructor (private width: int, private height: int, params: LayerParams) {
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
} // Layer

export default Layer;
