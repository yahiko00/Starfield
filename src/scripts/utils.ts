// helpers.ts

import rng = require("./rng");

namespace Utils {
    export function irangeNorm(min: int, max: int) {
        return Math.floor(rng.gnorm(0.0, 1.0) * (max - (min - 1.0))) + min;
    } // irangeNorm

    export function randomColorRGB(r?: int, g?: int, b?: int): Vec3i {
        return [r ? r : irangeNorm(0, 255), g ? g : irangeNorm(0, 255), b ? b : irangeNorm(0, 255)];
    } // randomColorRGB

    export function randomColorHSL(h?: float, s?: float, l?: float): Vec3f {
        return [h ? h : rng.gnorm(0.0, 1.0), s ? s : rng.gnorm(0.0, 1.0), l ? l : rng.gnorm(0.0, 1.0)];
    } // randomColorHSL
} // Utils

export = Utils;
