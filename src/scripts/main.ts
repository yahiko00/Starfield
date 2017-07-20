// main.ts

/// <reference path="./../../node_modules/pixi-typescript/pixi.js.d.ts" />

import dat = require ("exdat");
import PIXI = require("pixi.js");
import Filters = require("pixi-filters");
import rng = require("./rng");
import color = require("color-ts");
import Layer = require("./layer");
import Star = require("./star");
import Comet = require("./comet");

/* Logical Objects */
let params: any;
const layers: Layer.Layer[] = new Array(3);
const starSprites: PIXI.Sprite[][] = new Array(3);
const comets: Comet.Comet[] = [];

/* Graphical Objects */
let nebulaeShaderSrc: string;
let nebulaeShader: PIXI.Filter;
let bloomFilter: Filters.BloomFilter;
let cometContainer: PIXI.Container;
let cometParticle: PIXI.Texture;
let audio: HTMLAudioElement;

const gui = new dat.GUI({ load: JSON, autoPlace: false });

class Engine {
    public container: HTMLElement;
    public loader: PIXI.loaders.Loader;
    public renderer: PIXI.WebGLRenderer;
    public stage: PIXI.Container;
    public fps: int;
    public elapsed: double;

    constructor(width: int, height: int, containerId?: string, fps = 60) {
        this.loader = PIXI.loader;
        this.renderer = new PIXI.WebGLRenderer(width, height, { "antialias": true });
        this.stage = new PIXI.Container();
        this.fps = fps;
        this.elapsed = performance.now();

        this.container = containerId ? document.getElementById(containerId) || document.body : document.body;
        this.container.appendChild(this.renderer.view);
    } // constructor
} // Engine

let engine: Engine;

const fpsMeter = {
    nbFrames: 0,
    framerate: 0.0,
    elapsed: performance.now(),
    refresh: 500, // ms
    domElement: document.createElement("div")
}

window.onload = load;

// ==============
// === STATES ===
// ==============

function load() {
    const loader = new PIXI.loaders.Loader();
    loader
        .add("params", "./starfield.json")
        .add("nebulaeShaderSrc", "./nebulae.frag.glsl")
        .add("cometParticle", "./images/particle.png")
        .on("progress", (loader: PIXI.loaders.Loader, ressource: PIXI.loaders.Resource) => {
            loader; // Prevents TS unused parameter error
            console.log("Loading " + ressource.url + "...");
        })
        .on("error", (error: Error) => {
            console.log(error)
        })
        .load((loader: PIXI.loaders.Loader, ressources: any) => {
            loader; // Prevents TS unused parameter error
            params = ressources.params.data;
            nebulaeShaderSrc = ressources.nebulaeShaderSrc.data;
            cometParticle = ressources.cometParticle.texture;
            create();
        });
} // load

function create() {
    engine = new Engine(params.canvasW, params.canvasH, "game");

    /* Music */
    audio = new Audio("sounds/Divine Divinity - Main Theme.ogg");
    audio.addEventListener("canplaythrough", () => {
        audio.loop = true;
        audio.muted = params.mute;
        audio.play();
    }, false);
    
    /* Comet Container */
    cometContainer = new PIXI.Container();

    /* Filters */
    nebulaeShader = new PIXI.Filter("", nebulaeShaderSrc);
    bloomFilter = new Filters.BloomFilter();
    bloomFilter.blur = params.bloom;

    /* GUI */

    // Save Default Parameters
    // gui.remember(params);

    // Global parameters
    let guiPanel = document.getElementById("gui-panel") as HTMLElement;
    guiPanel.appendChild(gui.domElement);
    gui.add(params, "canvasW").onChange((value: int) => { params.canvasW = value; });
    gui.add(params, "canvasH").onChange((value: int) => { params.canvasH = value; });
    gui.add(params, "bloom", 0.0, 10.0, 0.5).onChange((value: double) => {
        params.blur = value;
        bloomFilter = new Filters.BloomFilter();
        bloomFilter.blur = params.bloom;
    });
    gui.add(params, "mute").onChange((value: boolean) => {
        params.mute = value;
        audio.muted = params.mute;
    });

    // Nebulae folder
    let guiNebulae = gui.addFolder("Nebulae");
    guiNebulae.add(params.nebulae, "redPow", 0.0, 10.0, 0.1).onChange((value: double) => { params.nebulae.redPow = value; });
    guiNebulae.add(params.nebulae, "greenPow", 0.0, 10.0, 0.1).onChange((value: double) => { params.nebulae.greenPow = value; });
    guiNebulae.add(params.nebulae, "bluePow", 0.0, 10.0, 0.1).onChange((value: double) => { params.nebulae.bluePow = value; });
    guiNebulae.add(params.nebulae, "noiseColor", 0.0, 1.0, 0.01).onChange((value: double) => { params.nebulae.noiseColor = value; });

    // Back Layer folder
    let guiLayerBack = gui.addFolder("Back Layer");
    guiLayerBack.add(params.layers[0], "nbStars", 0, 10000, 10).onChange((value: int) => { params.layers[0].nbStars = value; });
    guiLayerBack.add(params.layers[0], "sizeMin", 0.0, 10.0, 0.1).onChange((value: double) => { params.layers[0].sizeMin = value; });
    guiLayerBack.add(params.layers[0], "sizeMax", 0.0, 10.0, 0.1).onChange((value: double) => { params.layers[0].sizeMax = value; });
    guiLayerBack.add(params.layers[0], "speedX", -10.0, 10.0, 0.01).onChange((value: double) => { params.layers[0].speedX = value; });
    guiLayerBack.add(params.layers[0], "speedY", -10.0, 10.0, 0.01).onChange((value: double) => { params.layers[0].speedY = value; });
    guiLayerBack.add(params.layers[0], "brightSpeed", 0.00, 0.01, 0.0001).onChange((value: double) => { params.layers[0].brightSpeed = value; });
    guiLayerBack.addColor(params.layers[0], "tone").onChange((value: int | string) => {
        params.layers[0].tone = typeof value === "number" ? color.rgbNumberToString(value) : value;
    });

    // Middle Layer folder
    let guiLayerMiddle = gui.addFolder("Middle Layer");
    guiLayerMiddle.add(params.layers[1], "nbStars", 0, 5000, 10).onChange((value: int) => { params.layers[1].nbStars = value; });
    guiLayerMiddle.add(params.layers[1], "sizeMin", 0.0, 10.0, 0.1).onChange((value: double) => { params.layers[1].sizeMin = value; });
    guiLayerMiddle.add(params.layers[1], "sizeMax", 0.0, 10.0, 0.1).onChange((value: double) => { params.layers[1].sizeMax = value; });
    guiLayerMiddle.add(params.layers[1], "speedX", -10.0, 10.0, 0.01).onChange((value: double) => { params.layers[1].speedX = value; });
    guiLayerMiddle.add(params.layers[1], "speedY", -10.0, 10.0, 0.01).onChange((value: double) => { params.layers[1].speedY = value; });
    guiLayerMiddle.add(params.layers[1], "brightSpeed", 0.00, 0.01, 0.0001).onChange((value: double) => { params.layers[1].brightSpeed = value; });
    guiLayerMiddle.addColor(params.layers[1], "tone").onChange((value: int | string) => {
        params.layers[1].tone = typeof value === "number" ? color.rgbNumberToString(value) : value;
    });

    // Front Layer folder
    let guiLayerFront = gui.addFolder("Front Layer");
    guiLayerFront.add(params.layers[2], "nbStars", 0, 1000, 10).onChange((value: int) => { params.layers[2].nbStars = value; });
    guiLayerFront.add(params.layers[2], "sizeMin", 0.0, 10.0, 0.1).onChange((value: double) => { params.layers[2].sizeMin = value; });
    guiLayerFront.add(params.layers[2], "sizeMax", 0.0, 10.0, 0.1).onChange((value: double) => { params.layers[2].sizeMax = value; });
    guiLayerFront.add(params.layers[2], "speedX", -10.0, 10.0, 0.01).onChange((value: double) => { params.layers[2].speedX = value; });
    guiLayerFront.add(params.layers[2], "speedY", -10.0, 10.0, 0.01).onChange((value: double) => { params.layers[2].speedY = value; });
    guiLayerFront.add(params.layers[2], "brightSpeed", 0.00, 0.01, 0.0001).onChange((value: double) => { params.layers[2].brightSpeed = value; });
    guiLayerFront.addColor(params.layers[2], "tone").onChange((value: int | string) => {
        params.layers[2].tone = typeof value === "number" ? color.rgbNumberToString(value) : value;
    });

    // Comet folder
    let guiComet = gui.addFolder("Comet");
    guiComet.add(params.comet, "minSpawnDelay", 0, 10000, 10).onChange((value: int) => { params.comet.minSpawnDelay = value; });
    guiComet.add(params.comet, "maxSpawnDelay", 0, 10000, 10).onChange((value: int) => { params.comet.maxSpawnDelay = value; });
    guiComet.add(params.comet, "speed", 0.0, 10.0, 0.1).onChange((value: double) => { params.comet.speed = value; });
    guiComet.add(params.comet, "size",  0.0, 10.0, 0.1).onChange((value: double) => { params.comet.size = value; });
    guiComet.add(params.comet, "length", 0.0, 20.0, 0.01).onChange((value: double) => { params.comet.length = value; });
    guiComet.add(params.comet, "density", 0.0, 1.0, 0.01).onChange((value: double) => { params.comet.density = value; });
    guiComet.addColor(params.comet, "headColor").onChange((value: int | string) => {
        params.comet.headColor = typeof value === "number" ? color.rgbNumberToString(value) : value;
    });
    guiComet.addColor(params.comet, "tailColor").onChange((value: int | string) => {
        params.comet.tailColor = typeof value === "number" ? color.rgbNumberToString(value) : value;
    });

    // Seed
    gui.add(params, "seed", 0, 9999999999999, 1).onChange((value: int) => {
        params.seed = value;
        generate(params.seed);
    });

    // Regenerate button
    let guiButton = document.getElementById("gui-button") as HTMLButtonElement;
    let button = document.createElement("button");
    button.innerText = "Regenerate";
    button.id = "regenerate";
    button.onclick = generate.bind(undefined, undefined);
    guiButton.appendChild(button);

    /* FPS */
    fpsMeter.domElement.style.position = "fixed";
    fpsMeter.domElement.style.left = "0px";
    fpsMeter.domElement.style.bottom = "0px";
    fpsMeter.domElement.style.color = "#00ff00";
    fpsMeter.domElement.style.zIndex = "10";
    fpsMeter.domElement.style.fontFamily = "monospace";
    engine.container.appendChild(fpsMeter.domElement);

    generate();
    setInterval(update, 1000.0 / engine.fps);
    render();
} // create

function update() {
    let now = performance.now();
    let frameTime = now - engine.elapsed;
    let timeRatio = frameTime * engine.fps * 0.001

    /* Stars */
    for (let i = 0; i < layers.length; i++) {
        let layer = layers[i];

        for (let j = 0; j < layer.nbStars; j++) {
            let star = layer.stars[j];

            star.update(now, timeRatio);
            let sprite = starSprites[i][j];
            sprite.x = star.x;
        } // for j
    } // for i

    /* Comets */
    if (comets.length > 0) {
        for (let i = 0; i < comets.length; i++) {
            comets[i].update(frameTime, timeRatio, () => {
                // destroy
                Comet.Comet.setSpawnStart(now, params.comet);
                cometContainer.removeChildren();
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

    engine.elapsed = now;
} // update

function render() {
    requestAnimationFrame(render);
    let now = performance.now();
    let frameTime = now - fpsMeter.elapsed;

    /* Star Sprites */
    for (let i = 0; i < layers.length; i++) {
        let layer = layers[i];

        for (let j = 0; j < layer.nbStars; j++) {
            let star = layer.stars[j];
            let sprite = starSprites[i][j];
            sprite.position.set(star.x, star.y);
            let [red, green, blue] = color.hslToRgb([star.hsl[0], star.hsl[1], star.hsl[2]]);
            sprite.tint = (red << 16) + (green << 8) + (blue << 0);
        } // for j
    } // for i

    engine.renderer.render(engine.stage);

    /* FPS Meter */
    fpsMeter.nbFrames++;
    if (frameTime >= fpsMeter.refresh) {
        let framerate = 1000.0 * fpsMeter.nbFrames / frameTime;
        fpsMeter.domElement.innerHTML = "FPS: " + framerate.toFixed(2).toString();
        fpsMeter.elapsed = now;
        fpsMeter.nbFrames = 0;
    }
} // render

// ===============
// === HELPERS ===
// ===============

function createStarSprite(star: Star.Star) {
    let graphics = new PIXI.Graphics();
    graphics.lineStyle(0, 0, star.alpha);
    graphics.beginFill(0xffffff, star.alpha);
    graphics.drawCircle(star.size, star.size, star.size);
    graphics.endFill();

    let texture = PIXI.RenderTexture.create(graphics.width, graphics.height);
    engine.renderer.render(graphics, texture);
    let sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);
    return sprite;
} // createStarSprite

function spawnComet() {
    engine.stage.addChild(cometContainer);
    comets.push(new Comet.Comet(cometContainer, cometParticle, params.comet));
} // spawnComet

function generate(seed?: number) {
    let now = performance.now();
    engine.stage.removeChildren();

    /* Initialize RNG */
    if (seed === undefined || !isFinite(seed)) {
        params.seed = now;
    }
    else {
        params.seed = seed;
    }
    rng.repot(params.seed);
    for (let i = 0; i < gui.__controllers.length; i++) {
        if (gui.__controllers[i].property === "seed") {
            gui.__controllers[i].updateDisplay();
            break;
        }
    } // for i

    /* Setup Renderer */
    engine.renderer.backgroundColor = params.backgroundColor;
    engine.renderer.autoResize = true;
    engine.renderer.resize(params.canvasW, params.canvasH);

    /* Nebulae Background */
    nebulaeShader.uniforms.iResolution = new Float32Array([params.canvasW, params.canvasH]);
    nebulaeShader.uniforms.redPow = params.nebulae.redPow;
    nebulaeShader.uniforms.greenPow = params.nebulae.greenPow;
    nebulaeShader.uniforms.bluePow = params.nebulae.bluePow;
    nebulaeShader.uniforms.noiseColor = params.nebulae.noiseColor;
    nebulaeShader.uniforms.iGlobalTime = params.seed;
    let graphics = new PIXI.Graphics();
    graphics.filterArea = new PIXI.Rectangle(0, 0, params.canvasW, params.canvasH);
    graphics.filters = [nebulaeShader];
    let texture = PIXI.RenderTexture.create(params.canvasW, params.canvasH);
    engine.renderer.render(graphics, texture);
    let sprite = new PIXI.Sprite(texture);
    engine.stage.addChild(sprite);

    /* Create Layers and Stars */
    for (let i = 0; i < layers.length; i++) {
        layers[i] = new Layer.Layer(-20, -20, params.canvasW + 20, params.canvasH + 20, params.layers[i]);
        let layer = layers[i];
        starSprites[i] = new Array(layer.nbStars);

        for (let j = 0; j < layer.nbStars; j++) {
            let star = layer.stars[j];

            starSprites[i][j] = createStarSprite(star);
            engine.stage.addChild(starSprites[i][j]);
        } // for j
    } // for i

    /* Setup Comet Generation */
    params.comet.innerBounds.minX = -params.comet.size;
    params.comet.innerBounds.minY = -params.comet.size;
    params.comet.innerBounds.maxX = params.canvasW + params.comet.size;
    params.comet.innerBounds.maxY = params.canvasH + params.comet.size;
    let cometMargin = 50 * params.comet.length;
    params.comet.outerBounds.minX = -cometMargin;
    params.comet.outerBounds.minY = -cometMargin;
    params.comet.outerBounds.maxX = params.canvasW + cometMargin;
    params.comet.outerBounds.maxY = params.canvasH + cometMargin;
    Comet.Comet.setSpawnStart(now, params.comet);

    engine.stage.filters = [bloomFilter];
} // generate
