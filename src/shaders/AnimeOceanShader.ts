// Anime 2D Cel-Shaded Ocean Shader
// Flat banded water with animated ripple lines, horizon glow, and sun shimmer

export const AnimeOceanVertex = /* glsl */`
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vDist; // distance from camera for fog / horizon fade

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vDist = length(worldPos.xz); // radial distance from origin
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const AnimeOceanFragment = /* glsl */`
  uniform float uTime;
  uniform vec3 uCameraPos;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vDist;

  // ── Helpers ──────────────────────────────────────────────────────────────
  float hash(float n) { return fract(sin(n) * 43758.5453); }

  float noise1D(float x) {
    float i = floor(x);
    float f = fract(x);
    f = f*f*(3.0-2.0*f);
    return mix(hash(i), hash(i+1.0), f);
  }

  // ── Animated anime ripple lines ──────────────────────────────────────────
  // Returns intensity of a single moving ripple line band
  float rippleLine(vec2 wpos, float speed, float freq, float offset) {
    // Diagonal direction for interesting perspective
    float d = wpos.x * 0.15 + wpos.z + offset;
    d += noise1D(wpos.x * 0.02 + uTime * 0.3) * 8.0; // slight horizontal wobble
    float wave = sin(d * freq - uTime * speed);
    // Cel-shade the wave: hard threshold creates a sharp anime line
    return smoothstep(0.65, 0.75, wave * 0.5 + 0.5);
  }

  // ── Perspective-correct ripple for closer water ───────────────────────────
  float perspectiveRipple(vec2 wpos, float t) {
    float d1 = sin(wpos.z * 0.08 + wpos.x * 0.03 - t * 1.2) * 0.5 + 0.5;
    float d2 = sin(wpos.z * 0.15 - wpos.x * 0.05 - t * 0.8 + 1.5) * 0.5 + 0.5;
    float line1 = smoothstep(0.60, 0.68, d1);
    float line2 = smoothstep(0.60, 0.68, d2);
    return clamp(line1 + line2, 0.0, 1.0);
  }

  void main() {
    // ── Base water color (anime 2D banded palette) ──────────────────────────
    // Three tones: deep, mid, light — cel-shade between them by distance
    vec3 deepBlue  = vec3(0.02, 0.22, 0.58);  // #0638a0 — near water
    vec3 midBlue   = vec3(0.10, 0.45, 0.82);  // #1a74d0 — mid distance
    vec3 lightBlue = vec3(0.35, 0.70, 1.00);  // #59b3ff — far / horizon

    // Distance-based step banding (cel shade) — very anime
    float band = clamp(vDist / 9000.0, 0.0, 1.0);
    float step1 = smoothstep(0.0, 0.2, band);
    float step2 = smoothstep(0.2, 0.7, band);
    vec3 waterColor = mix(deepBlue, midBlue, step1);
    waterColor = mix(waterColor, lightBlue, step2);

    // ── Horizon glow ────────────────────────────────────────────────────────
    float horizonMask = smoothstep(7000.0, 10000.0, vDist);
    vec3 glowColor = vec3(0.45, 0.88, 1.0);  // #73e0ff — sky-blue cyan glow
    waterColor = mix(waterColor, glowColor, horizonMask * 0.9);
    // Bright rim right at the very edge
    float rimMask = smoothstep(9000.0, 10000.0, vDist);
    waterColor = mix(waterColor, vec3(0.8, 0.96, 1.0), rimMask * 0.6);

    // ── Anime ripple lines ───────────────────────────────────────────────────
    // Use world-space XZ so the lines scroll correctly
    float r1 = rippleLine(vWorldPos.xz, 1.5, 0.20, 0.0);
    float r2 = rippleLine(vWorldPos.xz, 1.0, 0.35, 4.7);
    float r3 = rippleLine(vWorldPos.xz, 1.8, 0.12, 2.3);
    float rClose = perspectiveRipple(vWorldPos.xz, uTime);

    // Ripples fade at the horizon (2D anime style — no ripples far away)
    float rippleFade = 1.0 - smoothstep(1500.0, 5000.0, vDist);
    float rippleTotal = (r1 * 0.5 + r2 * 0.4 + r3 * 0.3 + rClose * 0.6) * rippleFade;

    // Ripple color = lighter shade of water
    vec3 rippleColor = waterColor + vec3(0.15, 0.25, 0.35);
    waterColor = mix(waterColor, rippleColor, rippleTotal * 0.45);

    // ── Sun shimmer strip (flat anime style) ─────────────────────────────────
    // The sun reflection in anime is a hard bright strip, not a realistic caustic
    vec2 sunDir2D = normalize(vec2(0.2, -1.0)); // direction on water plane
    float along = dot(vWorldPos.xz, sunDir2D);
    float perp  = dot(vWorldPos.xz, vec2(-sunDir2D.y, sunDir2D.x));
    float strip = exp(-perp * perp * 0.0002) * exp(-along * along * 0.000002);
    // Animated shimmer across the strip
    float shimmer = sin(along * 0.15 - uTime * 2.0) * 0.5 + 0.5;
    shimmer = smoothstep(0.4, 0.7, shimmer) * strip;
    waterColor += vec3(0.6, 0.8, 1.0) * shimmer * 0.4;

    // ── Slight fog at very far distances ────────────────────────────────────
    float fog = smoothstep(8000.0, 12000.0, vDist);
    vec3 fogColor = vec3(0.65, 0.88, 1.0);
    waterColor = mix(waterColor, fogColor, fog);

    gl_FragColor = vec4(waterColor, 1.0);
  }
`;
