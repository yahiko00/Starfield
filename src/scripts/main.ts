// main.ts

/// <reference path="./../../node_modules/pixi-typescript/pixi.js.d.ts" />

import color = require("color-ts");
import Starfield = require("./starfield");
import Star = require("./star");
import dat = require ("exdat");
import PIXI = require("pixi.js");
import particles = require("pixi-particles");
import cometEmitterConfig = require("./comet-emitterconfig");

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
    ],
    comet: {
        minDelay: 0,
        maxDelay: 0,
        speed: 1,
        size: 2.0,
        length: 6.0,
        density: 0.5
    }
}

const starfields: Starfield.Starfield[] = new Array(2);
const starSprites: PIXI.Sprite[][] = new Array(2);

class Engine {
    public loader: PIXI.loaders.Loader;
    public renderer: PIXI.SystemRenderer;
    public stage: PIXI.Container;
    public emitter: particles.Emitter | undefined;

    constructor(width: number, height: number) {
        this.loader = PIXI.loader;
        this.renderer = PIXI.autoDetectRenderer(width, height, { "antialias": true });
    } // constructor
} // Engine

const engine = new Engine(params.canvasW, params.canvasH);

const fpsMeter = {
    frames: 0,
    framerate: 0.0,
    elapsed: Date.now(),
    domElement: document.createElement("div")
}

// ==============
// === STATES ===
// ==============

function load() {
    create();
} // load

function create() {
    /* Main Container */
    let container = document.getElementById("game") || document.body;
    container.appendChild(engine.renderer.view);

    /* GUI */
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

    /* FPS */
    fpsMeter.domElement.style.position = "fixed";
    fpsMeter.domElement.style.left = "0px";
    fpsMeter.domElement.style.bottom = "0px";
    fpsMeter.domElement.style.color = "#000000";
    fpsMeter.domElement.style.zIndex = "10";
    fpsMeter.domElement.style.fontFamily = "monospace";
    container.appendChild(fpsMeter.domElement);

    generate();
    update();
} // create

function update() {
    requestAnimationFrame(update);
    let now = Date.now();
    let deltaTime = now - fpsMeter.elapsed;

    /* Stars */
    for (let i = 0; i < 2; i++) {
        let starfield = starfields[i];

        for (let j = 0; j < starfield.nbStars; j++) {
            let star = starfield.stars[j];

            star.update();
            let sprite = starSprites[i][j];
            sprite.x = star.x;

        } // for j
    } // for i

    /* Comets */
    if (engine.emitter && engine.emitter.emit) {
        engine.emitter.update(deltaTime * 0.001);
        engine.emitter.updateOwnerPos(engine.emitter.ownerPos.x - 1.0, engine.emitter.ownerPos.y);
        if (engine.emitter.ownerPos.x < -10.0) {
            engine.emitter.updateOwnerPos(engine.renderer.width + 10.0, engine.emitter.ownerPos.y);    
        }
    }

    /* Supernovae */

    fpsMeter.frames++;
    if (deltaTime >= 1000) {
        let framerate = 1000 * fpsMeter.frames / deltaTime;
        fpsMeter.domElement.innerHTML = "FPS: " + framerate.toFixed(2).toString();
        fpsMeter.elapsed = now;
        fpsMeter.frames = 0;
    }
    render();
} // update

function render() {
    /* Sprites */
    for (let i = 0; i < 2; i++) {
        let starfield = starfields[i];

        for (let j = 0; j < starfield.nbStars; j++) {
            let star = starfield.stars[j];
            let sprite = starSprites[i][j];
            sprite.x = star.x;
            sprite.y = star.y;
            let [red, green, blue] = color.hslToRgb([star.hsl[0], star.hsl[1], star.hsl[2]]);
            sprite.tint = (red << 16) + (green << 8) + (blue << 0);
        } // for j
    } // for i

    let blurFilter = new PIXI.filters.BlurFilter(1.0);
    engine.stage.filters = [blurFilter];
    engine.renderer.render(engine.stage);
} // render

// ===============
// === HELPERS ===
// ===============

function generate() {
    engine.stage = new PIXI.Container();

    /* Setup Renderer */
    engine.renderer.backgroundColor = params.backgroundColor;
    engine.renderer.autoResize = true;
    engine.renderer.resize(params.canvasW, params.canvasH);

    /* Layers */
    starfields[0] = new Starfield.Starfield(params.canvasW + 20, params.canvasH + 20, params.starfields[0]);
    starfields[1] = new Starfield.Starfield(params.canvasW + 20, params.canvasH + 20, params.starfields[1]);

    /* Create the Comet Particle Emitter */
    cometEmitterConfig.scale.start *= params.comet.size;
    cometEmitterConfig.lifetime.max *= params.comet.length;
    cometEmitterConfig.lifetime.min *=  params.comet.length * params.comet.density;
    const emitterContainer = new PIXI.Container();
    engine.stage.addChild(emitterContainer);
    engine.emitter = new particles.Emitter(
        emitterContainer,
        [PIXI.Texture.fromImage("./images/particle.png")],
        cometEmitterConfig);
    engine.emitter.updateOwnerPos(engine.renderer.width / 2, engine.renderer.height / 2);
    engine.emitter.emit = false;

    /* Create Stars */
    let graphics = new PIXI.Graphics();
    for (let i = 0; i < 2; i++) {
        let starfield = starfields[i];
        starSprites[i] = new Array(starfield.nbStars);

        for (let j = 0; j < starfield.nbStars; j++) {
            let star = starfield.stars[j];

            starSprites[i][j] = createStarSprite(star, graphics);
            engine.stage.addChild(starSprites[i][j]);
        } // for j
    } // for i
} // generate

function rgbStringToNumber(rgb: int | string): int {
    let rgbInt: int;
    if (typeof rgb === "number") {
        rgbInt = rgb;
    }
    else {
        rgbInt = color.rgbStringToNumber(rgb);
    }
    return rgbInt;
} // rgbStringToNumber

function updateBackgroundColor(rgb: int | string) {
    let rgbInt = rgbStringToNumber(rgb);
    params.backgroundColor = rgbInt;
    engine.renderer.backgroundColor = rgbInt;
} // updateBackgroundColor

function createStarSprite(star: Star.Star, graphics: PIXI.Graphics) {
    graphics.clear();
    graphics.lineStyle(0, 0, star.alpha);
    graphics.beginFill(0xffffff, star.alpha);
    graphics.drawCircle(star.size, star.size, star.size);
    graphics.endFill();

    let texture = PIXI.RenderTexture.create(graphics.width, graphics.height);
    engine.renderer.render(graphics, texture);
    let sprite = new PIXI.Sprite(texture);
    return sprite;
} // createStarSprite

window.onload = load;
