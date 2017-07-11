// rng.ts

import random = require("fdrandom");

const rng = random.pot(performance.now());

export = rng;
