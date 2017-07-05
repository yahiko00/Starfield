// main.ts

import color = require("color-ts");
import Starfield = require("./starfield");
import GraphicsCached = require("./graphicscached");
import dat = require ("exdat");
import PIXI = require("pixi.js");

class GameRenderer extends PIXI.WebGLRenderer {
    public backgroundColor: int;
    public setBackgroundColor(rgb: number | string) {
        if (typeof rgb === "number") {
            this.backgroundColor = rgb;
        }
        else {
            this.backgroundColor = color.rgbStringToNumber(rgb);
        }
    }
} // GameRenderer

const params = {
    "backgroundColor": 0x000000,
    "canvasW": 800,
    "canvasH": 450,
    "starfields": [
        { // back starfield
            "toneRGB": 0x1515f0,
            "nbStars": 600,
            "sizeMin": 1.0,
            "sizeMax": 2.0,
            "speedX": -0.1,
            "speedY": 0
        },
        { // front starfield
            "toneRGB": 0xf0e315,
            "nbStars": 75,
            "sizeMin": 1.0,
            "sizeMax": 5.0,
            "speedX": -0.5,
            "speedY": 0
        }
    ]
}
const starfields: Starfield[] = new Array(2);
const renderer = new GameRenderer();
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
    renderer.setBackgroundColor(params.backgroundColor);
    renderer.autoResize = true;
    renderer.resize(params.canvasW, params.canvasH);

    starfields[0] = new Starfield(
        params.canvasW + 20, params.canvasH + 20,
        color.rgbNumberToHsl(params.starfields[0].toneRGB)[0], params.starfields[0].nbStars,
        { "min": params.starfields[0].sizeMin, "max": params.starfields[0].sizeMax },
        { "x": params.starfields[0].speedX, "y": params.starfields[0].speedY });
    starfields[1] = new Starfield(
        params.canvasW + 20, params.canvasH + 20,
        color.rgbNumberToHsl(params.starfields[1].toneRGB)[0], params.starfields[1].nbStars,
        { "min": params.starfields[1].sizeMin, "max": params.starfields[1].sizeMax },
        { "x": params.starfields[1].speedX, "y": params.starfields[1].speedY });

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

function updateBackgroundColor(rgb: int) {
    params.backgroundColor = rgb;
    renderer.setBackgroundColor(rgb);
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
    guiSfBack.addColor(params.starfields[0], "toneRGB").onChange((value: number) => { params.starfields[0].toneRGB = value; });
    guiSfBack.add(params.starfields[0], "nbStars", 0, 10000, 10).onChange((value: number) => { params.starfields[0].nbStars = value; });
    guiSfBack.add(params.starfields[0], "sizeMin", 0.0, 10.0, 0.1).onChange((value: number) => { params.starfields[0].sizeMin = value; });
    guiSfBack.add(params.starfields[0], "sizeMax", 0.0, 10.0, 0.1).onChange((value: number) => { params.starfields[0].sizeMax = value; });
    guiSfBack.add(params.starfields[0], "speedX", -10.0, 10.0, 0.01).onChange((value: number) => { params.starfields[0].speedX = value; });
    guiSfBack.add(params.starfields[0], "speedY", -10.0, 10.0, 0.01).onChange((value: number) => { params.starfields[0].speedY = value; });
    guiSfBack.open();
    let guiSfFront = gui.addFolder("Front Star Field");
    guiSfBack.addColor(params.starfields[1], "toneRGB").onChange((value: number) => { params.starfields[1].toneRGB = value; });
    guiSfFront.add(params.starfields[1], "nbStars", 0, 10000, 10).onChange((value: number) => { params.starfields[1].nbStars = value; });
    guiSfFront.add(params.starfields[1], "sizeMin", 0.0, 10.0, 0.1).onChange((value: number) => { params.starfields[1].sizeMin = value; });
    guiSfFront.add(params.starfields[1], "sizeMax", 0.0, 10.0, 0.1).onChange((value: number) => { params.starfields[1].sizeMax = value; });
    guiSfFront.add(params.starfields[1], "speedX", -10.0, 10.0, 0.01).onChange((value: number) => { params.starfields[1].speedX = value; });
    guiSfFront.add(params.starfields[1], "speedY", -10.0, 10.0, 0.01).onChange((value: number) => { params.starfields[1].speedY = value; });
    guiSfFront.open();
    let guiButton = document.getElementById("gui-button") as HTMLButtonElement;
    let button = document.createElement("button");
    button.innerText = "Regenerate";
    button.id = "regenerate";
    button.onclick = generate;
    guiButton.appendChild(button);
};
