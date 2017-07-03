"use strict";
const settings = require("./../package.json").settings;
const debug = settings.debug === true;
if (!debug) {
    console.log("Need to be in a debug environnment to run tests.")
}

let tape = require("tape");
// let random = require("./../debug/module");

tape("Test", t => {
    t.plan(1);
    t.ok(true);
    // t.plan(103);

    // t.equal(random(0, 0), 0);
    // t.equal(random(1, 1), 1);
    // t.equal(random(-1, -1), -1);

    // for (let i = 0; i < 100; i++) {
    //     let roll = random(1, 6);
    //     t.ok(roll >= 1 && roll <= 6, "Roll: " + roll.toString());
    // } // for i
});
