// vignetting.frag.glsl

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
	vec3 col = vec3(0.);

	// Vignetting
	// vec2 r = 2.0 * uv - 1.0;
	// float vb = max(abs(r.x), abs(r.y));
	// col *= (0.15 + 0.85 * (1.0 - exp(-(1.0 - vb) * 30.0)));

	gl_FragColor = vec4(col, 1.0);
}
