// comet.ts

import particles = require("pixi-particles");
import g2d = require("geometry2d");
import rng = require("./rng");

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
    minLifetime: float;
    maxLifetime: float;
    bounds: Bounds;
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
        this.bounds = params.bounds;

        /* Reset spawn delay */
        Comet.setSpawnDelay(params);

        /* Define lifetime */
        this.lifetime = rng.irange(params.minLifetime, params.maxLifetime);

        /* Define position */
        this.x = rng.range(params.bounds.minX, params.bounds.maxX);
        this.y = rng.range(params.bounds.minY, params.bounds.maxY);

        /* Define direction */
        let angle = rng.next() * 2 * Math.PI;
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
        this.emitter = new particles.Emitter(
            container,
            [PIXI.Texture.fromImage("./images/particle.png")],
            emitterConfig);
        this.emitter.updateOwnerPos(this.x, this.y);
        this.emitter.emit = true;
    } // constructor

    public update(deltaTime: float, destroy: () => void) {
        this.lifetime--;
        this.x += this.dx;
        this.y += this.dy;

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
 