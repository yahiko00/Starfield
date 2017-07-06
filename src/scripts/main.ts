// main.ts

/// <reference path="./../../node_modules/pixi-typescript/pixi.js.d.ts" />

import color = require("color-ts");
import Starfield = require("./starfield");
import BufferedGraphics = require("buffered-graphics");
import dat = require ("exdat");
import PIXI = require("pixi.js");

const params = {
    backgroundColor: 0x000000,
    canvasW: 800,
    canvasH: 450,
    starfields: [
        { // back starfield
            nbStars: 1200,
            sizeMin: 1.5,
            sizeMax: 2.5,
            speedX: -0.1,
            speedY: 0.0,
            brightSpeed: 0.001,
            tone: 0x1515f0
        },
        { // front starfield
            nbStars: 75,
            sizeMin: 1.5,
            sizeMax: 5.5,
            speedX: -0.5,
            speedY: 0.0,
            brightSpeed: 0.001,
            tone: 0xf0e315
        }
    ]
}

const starfields: Starfield.Starfield[] = new Array(2);

const fpsMeter = {
    framerate: 0.0,
    elapsed: 0
}

class Engine {
    public loader: PIXI.loaders.Loader;
    public renderer: PIXI.SystemRenderer;
    public stage: PIXI.Container;
    public graphics: BufferedGraphics.BufferedGraphics<PIXI.Graphics>;

    constructor() {
        this.loader = PIXI.loader;
        this.renderer = PIXI.autoDetectRenderer(params.canvasW, params.canvasH, { "antialias": true });
        this.stage = new PIXI.Container();
        this.graphics = new BufferedGraphics.BufferedGraphics(PIXI.Graphics);
    } // constructor
} // Engine

const engine = new Engine();

function generate() {
    engine.renderer.backgroundColor = params.backgroundColor;
    engine.renderer.autoResize = true;
    engine.renderer.resize(params.canvasW, params.canvasH);

    starfields[0] = new Starfield.Starfield(params.canvasW + 20, params.canvasH + 20, params.starfields[0]);
    starfields[1] = new Starfield.Starfield(params.canvasW + 20, params.canvasH + 20, params.starfields[1]);

    renderCache();
} // generate

function create() {
    engine.stage.addChild(engine.graphics.getMain());
    engine.stage.addChild(engine.graphics.getBuffer());

    generate();
    update();
} // create

function update() {
    requestAnimationFrame(update);
    let now = Date.now();
    fpsMeter.framerate = 1000 / (now - fpsMeter.elapsed);
    fpsMeter.elapsed = now;
    // TODO: show FPS

    for (let i = 0; i < 2; i++) {
        starfields[i].update();
    } // for i

    render();
} // update

function render() {
    engine.renderer.render(engine.stage);
    engine.graphics.switchBuffer();
    renderCache();
} // render

function renderCache() {
    engine.graphics.clearBuffer();
    for (let i = 0; i < 2; i++) {
        let starfield = starfields[i];

        for (let j = 0; j < starfield.nbStars; j++) {
            let star = starfield.stars[j];

            let cache = engine.graphics.getBuffer();
            let [red, green, blue] = color.hslToRgb([star.hsl[0], star.hsl[1], star.hsl[2]]);
            let rgb = (red << 16) + (green << 8) + (blue << 0);
            cache.lineStyle(0, 0, star.alpha);
            cache.beginFill(rgb, star.alpha);
            cache.drawCircle(star.x - 20.0, star.y - 10.0, star.size - 1.0);
            cache.endFill();
            cache.lineStyle(1, rgb, star.alpha / 2.0);
            cache.drawCircle(star.x - 20.0, star.y - 10.0, star.size);
        } // for j
    } // for i
} // renderCache

function rgbStringToNumber(rgb: int | string): int {
    let rgbInt: int;
    if (typeof rgb === "number") {
        rgbInt = rgb;
    }
    else {
        rgbInt = color.rgbStringToNumber(rgb);
    }
    return rgbInt;
}

function updateBackgroundColor(rgb: int | string) {
    let rgbInt = rgbStringToNumber(rgb);
    params.backgroundColor = rgbInt;
    engine.renderer.backgroundColor = rgbInt;
} // updateBackgroundColor

window.onload = () => {
    let container = document.getElementById("game") as HTMLElement;
    if (!container) {
        return;
    }
    container.appendChild(engine.renderer.view);
    create();

    /***** GUI *****/
    let gui = new dat.GUI({ "autoPlace": false });
    let guiPanel = document.getElementById("gui-panel") as HTMLElement;
    guiPanel.appendChild(gui.domElement);
    gui.addColor(params, "backgroundColor").onChange(updateBackgroundColor);
    gui.add(params, "canvasW").onChange((value: number) => { params.canvasW = value; });
    gui.add(params, "canvasH").onChange((value: number) => { params.canvasH = value; });
    let guiSfBack = gui.addFolder("Back Star Field");
    guiSfBack.add(params.starfields[0], "nbStars", 0, 10000, 10).onChange((value: number) => { params.starfields[0].nbStars = value; });
    guiSfBack.add(params.starfields[0], "sizeMin", 0.0, 10.0, 0.1).onChange((value: number) => { params.starfields[0].sizeMin = value; });
    guiSfBack.add(params.starfields[0], "sizeMax", 0.0, 10.0, 0.1).onChange((value: number) => { params.starfields[0].sizeMax = value; });
    guiSfBack.add(params.starfields[0], "speedX", -10.0, 10.0, 0.01).onChange((value: number) => { params.starfields[0].speedX = value; });
    guiSfBack.add(params.starfields[0], "speedY", -10.0, 10.0, 0.01).onChange((value: number) => { params.starfields[0].speedY = value; });
    guiSfBack.add(params.starfields[0], "brightSpeed", 0.00, 0.01, 0.0001).onChange((value: number) => { params.starfields[0].brightSpeed = value; });
    guiSfBack.addColor(params.starfields[0], "tone").onChange((value: number) => { params.starfields[0].tone = rgbStringToNumber(value); });
    guiSfBack.open();
    let guiSfFront = gui.addFolder("Front Star Field");
    guiSfFront.add(params.starfields[1], "nbStars", 0, 10000, 10).onChange((value: number) => { params.starfields[1].nbStars = value; });
    guiSfFront.add(params.starfields[1], "sizeMin", 0.0, 10.0, 0.1).onChange((value: number) => { params.starfields[1].sizeMin = value; });
    guiSfFront.add(params.starfields[1], "sizeMax", 0.0, 10.0, 0.1).onChange((value: number) => { params.starfields[1].sizeMax = value; });
    guiSfFront.add(params.starfields[1], "speedX", -10.0, 10.0, 0.01).onChange((value: number) => { params.starfields[1].speedX = value; });
    guiSfFront.add(params.starfields[1], "speedY", -10.0, 10.0, 0.01).onChange((value: number) => { params.starfields[1].speedY = value; });
    guiSfFront.add(params.starfields[1], "brightSpeed", 0.00, 0.01, 0.0001).onChange((value: number) => { params.starfields[1].brightSpeed = value; });
    guiSfFront.addColor(params.starfields[1], "tone").onChange((value: number) => { params.starfields[1].tone = rgbStringToNumber(value); });
    guiSfFront.open();
    let guiButton = document.getElementById("gui-button") as HTMLButtonElement;
    let button = document.createElement("button");
    button.innerText = "Regenerate";
    button.id = "regenerate";
    button.onclick = generate;
    guiButton.appendChild(button);
};
