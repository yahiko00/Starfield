// comet.ts

import particles = require("pixi-particles");
import g2d = require("geometry2d");
import rng = require("./rng");
import color = require("color-ts");

export interface Bounds {
    minX: float;
    minY: float;
    maxX: float;
    maxY: float;
}

export interface Params {
    minSpawnDelay: int;
    maxSpawnDelay: int;
    speed: float;
    size: float;
    length: float;
    density: float;
    headColor: int;
    tailColor: int;
    minLifetime: float;
    maxLifetime: float;
    innerBounds: Bounds;
    outerBounds: Bounds;
    emitterConfig: any;
} // Params

export class Comet {
    public static spawnStart: float;
    public static spawnDelay: float;
    public x: float;
    public y: float;
    private lifetime: float;
    private bounds: Bounds;
    private dx: float;
    private dy: float;
    private emitter: particles.Emitter;

    public static setSpawnStart(time: float, params: Params) {
        Comet.spawnStart = time;
        Comet.setSpawnDelay(params);
    } // setSpawnStart

    public static setSpawnDelay(params: Params) {
        Comet.spawnDelay = rng.range(params.minSpawnDelay, params.maxSpawnDelay);
    } // setSpawnDelay

    constructor(public container: PIXI.Container, params: Params) {
        this.bounds = params.outerBounds;

        /* Reset spawn delay */
        Comet.setSpawnDelay(params);

        /* Define lifetime */
        this.lifetime = rng.irange(params.minLifetime, params.maxLifetime);

        /* Define position */
        let width = params.innerBounds.maxX - params.innerBounds.minX;
        let height = params.innerBounds.maxY - params.innerBounds.minY;
        let angle: number;

        let l = rng.range(0.0, 2.0 * width + 2.0 * height); // linear position on the circumference
        if (l < width) { // up side
            this.x = l;
            this.y = params.innerBounds.minY;
            angle = rng.range(0, Math.PI);
        }
        else if (l < width + height) { // right side
            this.x = params.innerBounds.maxX;
            this.y = l - width;
            angle = rng.range(0.5 * Math.PI, 1.5 * Math.PI);
        }
        else if (l < 2 * width + height) { // down side
            this.x = l - width - height;
            this.y = params.innerBounds.maxY;
            angle = rng.range(Math.PI, 2 * Math.PI);
        }
        else { // left side
            this.x = params.innerBounds.minX;
            this.y = l - 2 * width - height;
            angle = rng.range(1.5 * Math.PI, 2.5 * Math.PI);
        }

        /* Define direction */
        let direction = g2d.angleToVector(angle, params.speed);
        this.dx = direction.x;
        this.dy = direction.y;

        /* Create Particle Emitter */
        let emitterConfig = JSON.parse(JSON.stringify(params.emitterConfig)); // clone with deep copy
        emitterConfig.scale.start *= params.size;
        emitterConfig.lifetime.max *= params.length;
        emitterConfig.lifetime.min *=  params.length * params.density;
        emitterConfig.startRotation.min = (angle + Math.PI) * 180 / Math.PI;
        emitterConfig.startRotation.max = emitterConfig.startRotation.min;
        emitterConfig.color.start = color.rgbNumberToString(params.headColor);
        emitterConfig.color.end = color.rgbNumberToString(params.tailColor);
        this.emitter = new particles.Emitter(
            container,
            [PIXI.Texture.fromImage("./images/particle.png")],
            emitterConfig);
        this.emitter.updateOwnerPos(this.x, this.y);
        this.emitter.emit = true;
    } // constructor

    public update(deltaTime: float, timeRatio: float, destroy: () => void) {
        this.lifetime--;
        this.x += this.dx * timeRatio;
        this.y += this.dy * timeRatio;

        if (this.x < this.bounds.minX || this.y < this.bounds.minY ||
            this.x > this.bounds.maxX || this.y > this.bounds.maxY ||
            this.lifetime <= 0) {
                this.emitter.emit = false;
                this.emitter.cleanup();
                this.emitter.destroy();
                destroy();
            }
        else if (this.emitter.emit) {
            this.emitter.update(deltaTime * 0.001);
            this.emitter.updateOwnerPos(this.x, this.y);
        }
    } // update()
} // Comet

export default Comet;
 