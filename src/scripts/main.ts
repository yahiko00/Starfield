// main.ts

/// <reference path="./../../node_modules/pixi-typescript/pixi.js.d.ts" />

import color = require("color-ts");
import Starfield = require("./starfield");
import GraphicsCached = require("./graphicscached");
import dat = require ("exdat");
import PIXI = require("pixi.js");

const params = {
    "backgroundColor": 0x000000,
    "canvasW": 800,
    "canvasH": 450,
    "starfields": [
        { // back starfield
            "nbStars": 1200,
            "sizeMin": 1.0,
            "sizeMax": 2.0,
            "speedX": -0.1,
            "speedY": 0.0,
            "brightSpeed": 0.001,
            "tone": 0x1515f0
        },
        { // front starfield
            "nbStars": 75,
            "sizeMin": 1.0,
            "sizeMax": 5.0,
            "speedX": -0.5,
            "speedY": 0.0,
            "brightSpeed": 0.001,
            "tone": 0xf0e315
        }
    ]
}
const starfields: Starfield.Starfield[] = new Array(2);
const renderer = PIXI.autoDetectRenderer(params.canvasW, params.canvasH);
const stage = new PIXI.Container();
const graphics = new GraphicsCached(PIXI.Graphics);

function game() {
    stage.addChild(graphics.getGraphics());
    stage.addChild(graphics.getCache());

    generate();

    (function gameLoop() {
        requestAnimationFrame(gameLoop);
        update();
        render();
    })();
} // game

function generate() {
    renderer.backgroundColor = params.backgroundColor;
    renderer.autoResize = true;
    renderer.resize(params.canvasW, params.canvasH);

    starfields[0] = new Starfield.Starfield(params.canvasW + 20, params.canvasH + 20, params.starfields[0]);
    starfields[1] = new Starfield.Starfield(params.canvasW + 20, params.canvasH + 20, params.starfields[1]);

    renderCache();
} // generate

function update() {
    for (let i = 0; i < 2; i++) {
        starfields[i].update();
    } // for i
} // update

function render() {
    renderer.render(stage);
    graphics.switchCache();
    renderCache();
} // render

function renderCache() {
    graphics.clearCache();
    for (let i = 0; i < 2; i++) {
        let starfield = starfields[i];

        for (let j = 0; j < starfield.nbStars; j++) {
            let star = starfield.stars[j];

            let cache = graphics.getCache();
            let [red, green, blue] = color.hslToRgb([star.hsl[0], star.hsl[1], star.hsl[2]]);
            cache.beginFill((red << 16) + (green << 8) + (blue << 0), star.alpha);
            cache.drawCircle(star.x - 20, star.y - 10, star.size);
            cache.endFill();
        }
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
    renderer.backgroundColor = rgbInt;
} // updateBackgroundColor

window.onload = () => {
    (document.getElementById("game") as HTMLElement).appendChild(renderer.view);
    game();

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
