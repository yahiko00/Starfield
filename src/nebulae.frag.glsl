// nebulae.frag.glsl
// inspired from: https://www.shadertoy.com/view/lslSDS

precision mediump float;

uniform vec2  iResolution;
uniform float iGlobalTime;
uniform float redPow;
uniform float greenPow;
uniform float bluePow;
uniform float noiseColor;

#define PI 3.141592653589793

// Simplex Noise by IQ
vec2 hash(vec2 p) {
	p = vec2(dot(p, vec2(127.1, 311.7)),
			 dot(p, vec2(269.5, 183.3)));

	return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(in vec2 p) {
    const float K1 = 0.366025404; // (sqrt(3) - 1) / 2;
    const float K2 = 0.211324865; // (3 - sqrt(3)) / 6;

	vec2 i = floor(p + K1 * (p.x + p.y));
	
    vec2 a = p - i + K2 * (i.x + i.y);
    vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0); // vec2 of = 0.5 + 0.5 * vec2(sign(a.x - a.y), sign(a.y - a.x));
    vec2 b = a - o + K2;
	vec2 c = a - 1.0 + 2.0 * K2;

    vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);

	vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));

    return dot(n, vec3(70.0));
}

const mat2 m = mat2(0.80, 0.60, -0.60, 0.80);

float fbm4(in vec2 p) {
    float f = 0.0;
    f += 0.5000 * noise(p); p = m * p * 2.02;
    f += 0.2500 * noise(p); p = m * p * 2.03;
    f += 0.1250 * noise(p); p = m * p * 2.01;
    f += 0.0625 * noise(p);
    return f;
}

float marble(in vec2 p) {
	return cos(p.x + fbm4(p));
}

float dowarp (in vec2 q, out vec2 a, out vec2 b) {
	float ang = 0.;
	ang = 1.2345 * sin(33.33); // 0.015 * iGlobalTime;
	mat2 m1 = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
	ang = 0.2345 * sin(66.66); // 0.021 * iGlobalTime;
	mat2 m2 = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));

	a = vec2(marble(m1 * q), marble(m2 * q + vec2(1.12, 0.654)));

	ang = 0.543 * cos(13.33); // 0.011 * iGlobalTime;
	m1 = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
	ang = 1.128 * cos(53.33); // 0.018 * iGlobalTime;
	m2 = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));

	b = vec2(marble(m2 * (q + a)), marble(m1 * (q + a)));

	return marble(q + b + vec2(0.32, 1.654));
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

	vec2 q = 2. * uv - 1.;
	q.y *= iResolution.y / iResolution.x;

	// camera	
	vec3 rd = normalize(vec3(q.x, q.y, 1.));

	// Nebulae Background
	q.x = 0.5 + atan(rd.z, rd.x) / (2. * PI);
	q.y = 0.5 - asin(rd.y) / PI + 0.512 + 0.0001 * iGlobalTime;
	q *= 2.34;

	vec2 wa = vec2(0.);
	vec2 wb = vec2(0.);
	float f = dowarp(q, wa, wb);
	f = 0.5 + 0.5 * f;

	// Colorization
	vec3 col = vec3(f);
	float wc = f;
	col = vec3(wc, wc * wc, wc * wc * wc);             // increase: R, G, B
	wc = abs(wa.x);
	col -= vec3(wc * wc, wc, wc * wc * wc);            // decrease: G, R, B
	wc = abs(wb.x);
	col += vec3(wc * wc * wc, wc * wc, wc);            // increase: B, G, R
	col *= 0.7;                                        // decrease all RGB components: more black, less white
	col.r = pow(col.r, redPow);                        // high pass filter for red
	col.g = pow(col.g, greenPow);                      // high pass filter for green
	col.b = pow(col.b, bluePow);                       // high pass filter for blue
	col = smoothstep(0., 1., col);                     // Smoothen color gradients
	//col = 0.5 - (1.4 * col - 0.7) * (1.4 * col - 0.7); // color translation
	col = 0.75 * sqrt(col);                            // increase all RGB components: less black, more white
	col *= 1. - noiseColor * fbm4(8. * q);             // add noise
	col = clamp(col, 0., 1.);

	// Vignetting
	// vec2 r = -1.0 + 2.0 * uv;
	// float vb = max(abs(r.x), abs(r.y));
	// col *= (0.15 + 0.85 * (1.0 - exp(-(1.0 - vb) * 30.0)));

	gl_FragColor = vec4(col, 1.0);
}
