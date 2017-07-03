// app.ts

/// <reference path="./../../node_modules/phaser/typescript/phaser.d.ts" />

// import color = require("color");

/*
function randomColor() {
    let red = random(0, 255);
    let green = random(0, 255);
    let blue = random(0, 255);

    return color.rgb(reg, green, blue);
} // randomColor
*/

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
    constructor (
        private translationSpeed: { x: number, y: number },
        // private tone: number,
        private colorSpeed: number,
        private nbStars: number,
        private canvasW: number,
        private canvasH: number) {
            this.translationSpeed = translationSpeed;
            // this.tone = tone;
            this.colorSpeed = colorSpeed;
            this.nbStars = nbStars;
            this.canvasW = canvasW;
            this.canvasH = canvasH;
            this.stars = new Array(this.nbStars);

            for (let i = 0; i <= this.nbStars; i++) {
                this.stars[i] = new Star(random(0, this.canvasW), random(0, this.canvasH), this.translationSpeed);
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

function random(min: number, max: number) {
    let nMax = max;
    let nMin = min;
    let aleat = Math.floor(Math.random() * (nMax - (nMin - 1))) + nMin;
    return aleat;
}

class Star {
    public pos: { x: number, y: number };
    public alpha: number;
    public up: boolean;
    public adder: number;
    public limit: number;
    public size: { w: number, h: number };
    public red: number;
    public green: number;
    public blue: number;
    public speed: { x: number, y: number };

    constructor(x: number, y: number, speed: { x: number, y: number }) {
        this.pos = { x: x, y: y };
        this.alpha = 1.0;
        this.up = false;
        this.adder = random(10, 40);
        this.limit = 50;

        this.size = { w: random(1, 3), h: random(1, 3) }; // letiable size

        if (random(1, 2) == 2) {
            this.up = false;
        }
        else {
            this.up = true;
        }

        this.red = random(0, 255);
        this.green = random(0, 255);
        this.blue = random(0, 255);

        this.speed = speed;
    } // constructor

    update() {
        if (this.up) {
            this.adder += 1;
            if (this.adder > this.limit) {
                this.up = false;
            }

        }
        else {
            this.adder -= 1;
            if (this.adder < 1) {
                this.up = true;
            }

        }

        this.alpha = this.adder / this.limit;

        // move to left and warp
        this.pos.x += (this.speed.x);
        if (this.pos.x < -10) {
            this.pos.x = canvasW + 10;
            this.pos.y = random(0, canvasH);
        }
    } // update

    drawCache() {
        let graphics = canvas.getCache();
        graphics.beginFill((this.red << 16) + (this.green << 8) + (this.blue << 0), this.alpha);
        graphics.drawRect(this.pos.x, this.pos.y, this.size.w, this.size.h);
    } // drawCache
} // Star

// creation of stars

let canvasW = 800, canvasH = 450;
let game: Phaser.Game;
let totalStars = 100;
let stars: Star[][] = new Array(2);
let starSpeeds: { x: number, y: number }[] = new Array(2);
let starfields: Starfield[] = new Array(2);
let canvas: GraphicsCached;


function create() {
    game.stage.backgroundColor = "#000000";
    canvas = new GraphicsCached(game);

    starfields[0] = new Starfield({ x: -0.1, y: 0 }, +1, 100, canvasW, canvasH);
    starfields[1] = new Starfield({ x: -0.5, y: 0 }, -1, 100, canvasW, canvasH);

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
