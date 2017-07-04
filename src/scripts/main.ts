// main.ts

/// <reference path="./../../node_modules/phaser/typescript/phaser.d.ts" />

import color = require("color-ts");
import random = require("fdrandom");

interface Point {
    x: float;
    y: float;
} // Point

type int = number;
type float = number;
type Vec3i = [int, int, int];
type Vec3f = [float, float, float];

function irangeNorm(min: int, max: int) {
    return Math.floor(rng.gnorm(0.0, 1.0) * (max - (min - 1.0))) + min;
} // irangeNorm

function randomColorRGB(r?: int, g?: int, b?: int): Vec3i {
    return [r ? r : irangeNorm(0, 255), g ? g : irangeNorm(0, 255), b ? b : irangeNorm(0, 255)];
} // randomColorRGB

function randomColorHSL(h?: float, s?: float, l?: float): Vec3f {
    return [h ? h : rng.gnorm(0.0, 1.0), s ? s : rng.gnorm(0.0, 1.0), l ? l : rng.gnorm(0.0, 1.0)];
} // randomColorHSL

class GraphicsCached {
    private isSwitched: boolean;
    private graphicsA: Phaser.Graphics;
    private graphicsB: Phaser.Graphics;
    constructor(game: Phaser.Game) {
        this.isSwitched = false;
        this.graphicsA = game.add.graphics(0, 0);
        this.graphicsB = game.add.graphics(0, 0);
    } // constructor

    switchCache() {
        if (!this.isSwitched) {
            this.graphicsA.visible = false;
            this.graphicsB.visible = true;
        }
        else {
            this.graphicsA.visible = true;
            this.graphicsB.visible = false;
        }
        this.isSwitched != this.isSwitched;
    } // switchCache

    getGraphics() {
        if (!this.isSwitched) {
            return this.graphicsA;
        }
        else {
            return this.graphicsB;
        }
    } // getGraphics

    getCache() {
        if (!this.isSwitched) {
            return this.graphicsB;
        }
        else {
            return this.graphicsA;
        }
    } // getCache

    clearGraphcis() {
        this.getGraphics().clear();
    } // clearGraphics

    clearCache() {
        this.getCache().clear();
    } // clearCache
} // GraphicsCached

class Starfield {
    public stars: Star[];
    private tone: float;
    constructor (
        private width: int,
        private height: int,
        private nbStars: int,
        private sizeRange: [float, float],
        private translationSpeed: Point) {
            this.translationSpeed = translationSpeed;
            this.nbStars = nbStars;
            this.sizeRange = sizeRange;
            this.width = width;
            this.height = height;
            this.stars = new Array(this.nbStars);
            this.tone = rng.next();

            for (let i = 0; i <= this.nbStars; i++) {
                this.stars[i] = new Star(rng.irange(0, this.width), rng.irange(0, this.height), this.sizeRange, this.tone, this.translationSpeed);
            } // for i
    } // constructor

    update() {
        for (let i = 0; i <= this.nbStars; i++) {
            this.stars[i].update();
        } // for i
    }

    drawCache() {
        for (let i = 0; i <= this.nbStars; i++) {
            this.stars[i].drawCache();
        } // for i
    }
} // Starfield

class Star implements Point {
    public alpha: float;
    public size: float;
    public hsl: Vec3f;

    private adder: float;

    constructor(public x: float, public y: float, sizeRange: [float, float], tone: float, private speed: { x: float, y: float }) {
        this.alpha = 1.0;
        this.size = rng.range(sizeRange[0], sizeRange[1]);
        let hue = rng.gnorm(tone - 0.2, tone + 0.2);
        if (hue < 0.0) hue += 1.0;
        else if (hue > 1.0) hue -= 1.0;
        this.hsl = randomColorHSL(hue);
        this.speed = speed;

        this.adder = rng.irange(0, 1) ? 0.001 : -0.001;

    } // constructor

    update() {
        if ((this.hsl[color.HSL.L] <= 0.5 && this.adder < 0.0) || (this.hsl[color.HSL.L] >= 1.0 && this.adder > 0.0)) {
            this.adder *= -1.0;
        }
        this.hsl[color.HSL.L] += this.adder;

        // Move to left and warp
        this.x += (this.speed.x);
        if (this.x < -10.0) {
            this.x = canvasW + 10.0;
            this.y = rng.range(0.0, canvasH);
        }
    } // update

    drawCache() {
        let graphics = canvas.getCache();
        let [red, green, blue] = color.hslToRgb([this.hsl[color.HSL.H], this.hsl[color.HSL.S], this.hsl[color.HSL.L]]);
        graphics.beginFill((red << 16) + (green << 8) + (blue << 0), this.alpha);
        graphics.drawCircle(this.x, this.y, this.size);
    } // drawCache
} // Star


let canvasW = 800;
let canvasH = 450;
let game: Phaser.Game;
let starfields: Starfield[] = new Array(2);
let canvas: GraphicsCached;
let rng = random.pot(Date.now());

function create() {
    game.stage.backgroundColor = "#000000";
    canvas = new GraphicsCached(game);

    starfields[0] = new Starfield(canvasW, canvasH, 100, [1.0, 2.0], { x: -0.1, y: 0 });
    starfields[1] = new Starfield(canvasW, canvasH, 100, [1.0, 5.0], { x: -0.5, y: 0 });

    renderCache();
} // create

function update() {
    for (let i = 0; i < 2; i++) {
        starfields[i].update();
    } // for i
} // update

function render() {
    canvas.switchCache();
    renderCache();
} // render

function renderCache() {
    canvas.clearCache();
    for (let i = 0; i < 2; i++) {
        starfields[i].drawCache();
    } // for i
} // renderCache

window.onload = () => {
    game = new Phaser.Game(canvasW, canvasH, Phaser.AUTO, "game", { "create": create, "update": update, "render": render });
};
