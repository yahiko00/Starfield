// main.ts

/// <reference path="./../../node_modules/pixi-typescript/pixi.js.d.ts" />

import color = require("color-ts");
import Layer = require("./layer");
import Star = require("./star");
import dat = require ("exdat");
import PIXI = require("pixi.js");
import Comet = require("./comet");

const params = {
    backgroundColor: 0x000000,
    canvasW: 800,
    canvasH: 450,
    layers: [
        { // back starfield
            nbStars: 1200,
            sizeMin: 1.5,
            sizeMax: 2.5,
            speedX: -0.1,
            speedY: 0.0,
            brightSpeed: 0.001,
            tone: 0x1515f0
            // TODO: bounds
        },
        { // front starfield
            nbStars: 75,
            sizeMin: 1.5,
            sizeMax: 5.5,
            speedX: -0.5,
            speedY: 0.0,
            brightSpeed: 0.001,
            tone: 0xf0e315
            // TODO: bounds
        }
    ],
    comet: {
        minSpawnDelay: 1000, // ms
        maxSpawnDelay: 5000, // ms
        speed: 1.0,
        size: 3.0,
        length: 10.0,
        density: 0.5,
        minLifetime: 100000.0, // ms
        maxLifetime: 100000.0, // ms
        bounds: {
            minX: 0,
            minY: 0,
            maxX: 800,
            maxY: 450
        },
        emitterConfig: undefined
    }
}

const layers: Layer.Layer[] = new Array(2);
const starSprites: PIXI.Sprite[][] = new Array(2);
const comets: Comet.Comet[] = [];

class Engine {
    public loader: PIXI.loaders.Loader;
    public renderer: PIXI.SystemRenderer;
    public stage: PIXI.Container;

    constructor(width: int, height: int) {
        this.loader = PIXI.loader;
        this.renderer = PIXI.autoDetectRenderer(width, height, { "antialias": true });
    } // constructor
} // Engine

const engine = new Engine(params.canvasW, params.canvasH);

const fpsMeter = {
    nbFrames: 0,
    framerate: 0.0,
    elapsed: Date.now(),
    domElement: document.createElement("div")
}

// ==============
// === STATES ===
// ==============

function load() {
    readTextFile("comet-emitter.json", (error: string, json: string) => {
        if (error) {
            console.log(error);
        }
        else {
            params.comet.emitterConfig = JSON.parse(json);
            create();
        }
    });
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
    gui.add(params, "canvasW").onChange((value: int) => { params.canvasW = value; });
    gui.add(params, "canvasH").onChange((value: int) => { params.canvasH = value; });

    // Back Layer folder
    let guiLayerBack = gui.addFolder("Back Layer");
    guiLayerBack.add(params.layers[0], "nbStars", 0, 10000, 10).onChange((value: int) => { params.layers[0].nbStars = value; });
    guiLayerBack.add(params.layers[0], "sizeMin", 0.0, 10.0, 0.1).onChange((value: float) => { params.layers[0].sizeMin = value; });
    guiLayerBack.add(params.layers[0], "sizeMax", 0.0, 10.0, 0.1).onChange((value: float) => { params.layers[0].sizeMax = value; });
    guiLayerBack.add(params.layers[0], "speedX", -10.0, 10.0, 0.01).onChange((value: float) => { params.layers[0].speedX = value; });
    guiLayerBack.add(params.layers[0], "speedY", -10.0, 10.0, 0.01).onChange((value: float) => { params.layers[0].speedY = value; });
    guiLayerBack.add(params.layers[0], "brightSpeed", 0.00, 0.01, 0.0001).onChange((value: float) => { params.layers[0].brightSpeed = value; });
    guiLayerBack.addColor(params.layers[0], "tone").onChange((value: int) => { params.layers[0].tone = rgbStringToNumber(value); });

    // Front Layer folder
    let guiLayerFront = gui.addFolder("Front Layer");
    guiLayerFront.add(params.layers[1], "nbStars", 0, 10000, 10).onChange((value: int) => { params.layers[1].nbStars = value; });
    guiLayerFront.add(params.layers[1], "sizeMin", 0.0, 10.0, 0.1).onChange((value: float) => { params.layers[1].sizeMin = value; });
    guiLayerFront.add(params.layers[1], "sizeMax", 0.0, 10.0, 0.1).onChange((value: float) => { params.layers[1].sizeMax = value; });
    guiLayerFront.add(params.layers[1], "speedX", -10.0, 10.0, 0.01).onChange((value: float) => { params.layers[1].speedX = value; });
    guiLayerFront.add(params.layers[1], "speedY", -10.0, 10.0, 0.01).onChange((value: float) => { params.layers[1].speedY = value; });
    guiLayerFront.add(params.layers[1], "brightSpeed", 0.00, 0.01, 0.0001).onChange((value: float) => { params.layers[1].brightSpeed = value; });
    guiLayerFront.addColor(params.layers[1], "tone").onChange((value: int) => { params.layers[1].tone = rgbStringToNumber(value); });

    // Comet folder
    let guiComet = gui.addFolder("Comet");
    guiComet.add(params.comet, "minSpawnDelay", 0, 10000, 10).onChange((value: int) => { params.comet.minSpawnDelay = value; });
    guiComet.add(params.comet, "maxSpawnDelay", 0, 10000, 10).onChange((value: int) => { params.comet.maxSpawnDelay = value; });
    guiComet.add(params.comet, "speed", 0.0, 10.0, 0.1).onChange((value: float) => { params.comet.speed = value; });
    guiComet.add(params.comet, "size",  0.0, 10.0, 0.1).onChange((value: float) => { params.comet.size = value; });
    guiComet.add(params.comet, "length", 0.0, 20.0, 0.01).onChange((value: float) => { params.comet.length = value; });
    guiComet.add(params.comet, "density", 0.0, 1.0, 0.01).onChange((value: float) => { params.comet.density = value; });

    // Regenerate button
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
    let frameTime = now - fpsMeter.elapsed;

    /* Stars */
    for (let i = 0; i < 2; i++) {
        let starfield = layers[i];

        for (let j = 0; j < starfield.nbStars; j++) {
            let star = starfield.stars[j];

            star.update();
            let sprite = starSprites[i][j];
            sprite.x = star.x;
        } // for j
    } // for i

    /* Comets */
    if (comets.length > 0) {
        for (let i = 0; i < comets.length; i++) {
            comets[i].update(frameTime, () => {
                // destroy
                Comet.Comet.setSpawnStart(now, params.comet);
                comets.splice(i, 1);
                i--;
            });
        } // for i
    }
    else {
        if (now - Comet.Comet.spawnStart >= Comet.Comet.spawnDelay) {
            spawnComet();
        }
    }

    /* Supernovae */

    fpsMeter.nbFrames++;
    if (frameTime >= 1000) {
        let framerate = 1000 * fpsMeter.nbFrames / frameTime;
        fpsMeter.domElement.innerHTML = "FPS: " + framerate.toFixed(2).toString();
        fpsMeter.elapsed = now;
        fpsMeter.nbFrames = 0;
    }
    render();
} // update

function render() {
    /* Sprites */
    for (let i = 0; i < 2; i++) {
        let starfield = layers[i];

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

function readTextFile(filename: string, callback: (error?: any, data?: string) => void) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", filename, false);
    rawFile.onreadystatechange = () => {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
                callback(undefined, rawFile.responseText);
            }
        }
        callback("Error loading " + filename, undefined)
    }
    rawFile.send();
} // readTextFile

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

function spawnComet() {
    const container = new PIXI.Container();
    engine.stage.addChild(container);
    comets.push(new Comet.Comet(container, params.comet));
} // spawnComet

function generate() {
    engine.stage = new PIXI.Container();

    /* Setup Renderer */
    engine.renderer.backgroundColor = params.backgroundColor;
    engine.renderer.autoResize = true;
    engine.renderer.resize(params.canvasW, params.canvasH);

    /* Layers */
    layers[0] = new Layer.Layer(params.canvasW + 20, params.canvasH + 20, params.layers[0]);
    layers[1] = new Layer.Layer(params.canvasW + 20, params.canvasH + 20, params.layers[1]);

    /* Create Stars */
    let graphics = new PIXI.Graphics();
    for (let i = 0; i < 2; i++) {
        let starfield = layers[i];
        starSprites[i] = new Array(starfield.nbStars);

        for (let j = 0; j < starfield.nbStars; j++) {
            let star = starfield.stars[j];

            starSprites[i][j] = createStarSprite(star, graphics);
            engine.stage.addChild(starSprites[i][j]);
        } // for j
    } // for i

    /* Setup Comet Generation */
    let cometMargin = 10 * params.comet.length;
    params.comet.bounds.minX = -cometMargin;
    params.comet.bounds.minY = -cometMargin;
    params.comet.bounds.maxX = params.canvasW + cometMargin;
    params.comet.bounds.maxY = params.canvasH + cometMargin;
    Comet.Comet.setSpawnStart(Date.now(), params.comet);
} // generate

window.onload = load;
