// Anime Sky Shader
// Everything done in a single sky dome: gradient blue, puffy clouds, glowing sun

export const AnimeSkyVertex = /* glsl */`
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const AnimeSkyFragment = /* glsl */`
  varying vec3 vDir;
  uniform float uTime;

  // ── Noise helpers ──────────────────────────────────────────────────────────
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.55;
    for (int i=0;i<6;i++) { v+=a*noise(p); p*=2.1; a*=0.5; }
    return v;
  }

  // ── Cloud density at a sky direction ─────────────────────────────────────
  float cloud(vec3 dir, float speed, float scale, float threshold) {
    if (dir.y < 0.0) return 0.0;
    // Project direction onto a horizontal cloud plane
    vec2 uv = dir.xz / (dir.y + 0.1) * scale + uTime * speed;
    float density = fbm(uv);
    density = smoothstep(threshold, threshold + 0.18, density);
    // Fade clouds near the horizon
    float horizonFade = smoothstep(0.0, 0.25, dir.y);
    return density * horizonFade;
  }

  void main() {
    vec3 dir = normalize(vDir);

    // ── Sky gradient ────────────────────────────────────────────────────────
    // Horizon = light sky blue, zenith = deep anime blue
    float h = clamp(dir.y, 0.0, 1.0);
    vec3 zenith  = vec3(0.08, 0.45, 0.92);  // deep vivid blue #1473eb
    vec3 midsky  = vec3(0.30, 0.68, 0.98);  // sky blue #4DADFA
    vec3 horizon = vec3(0.70, 0.88, 1.00);  // pale horizon #B3E0FF
    vec3 skyColor;
    if (h < 0.15)      skyColor = mix(horizon, midsky, h / 0.15);
    else               skyColor = mix(midsky,  zenith, (h-0.15)/0.85);

    // ── Sun ─────────────────────────────────────────────────────────────────
    vec3 sunDir = normalize(vec3(0.2, 0.5, -0.85));
    float sunDot = dot(dir, sunDir);
    // Hard disc — pure bright white
    float sunDisc = smoothstep(0.9996, 0.9999, sunDot);
    // Inner golden glow ring
    float sunGlow1 = pow(clamp(sunDot, 0.0, 1.0), 80.0) * 0.6;
    // Wide warm atmospheric haze (no tint, just brightening)
    float sunGlow2 = pow(clamp(sunDot, 0.0, 1.0), 10.0) * 0.12;
    // Lens shimmer cross streaks
    vec2 sd = vec2(dir.x - sunDir.x, dir.y - sunDir.y);
    float streak = max(
      exp(-abs(sd.x) * 100.0) * exp(-pow(sd.y, 2.0) * 180.0),
      exp(-abs(sd.y) * 100.0) * exp(-pow(sd.x, 2.0) * 180.0)
    ) * 0.3 * clamp(sunDot * 3.0, 0.0, 1.0);
    // All sun effects use warm white — no cyan, no green
    vec3 sunColor = vec3(1.0, 0.98, 0.90);
    skyColor += sunColor * (sunDisc * 8.0 + sunGlow1 + sunGlow2 + streak);
    // Clamp sky so sun doesn't blow out nearby sky blue
    skyColor = min(skyColor, vec3(1.0));

    // ── Clouds ───────────────────────────────────────────────────────────────
    // Layer 1: main fluffy cumulus layer (closer, larger)
    float c1 = cloud(dir, 0.006, 0.8, 0.52);
    // Layer 2: higher wispy clouds (farther, smaller features)
    float c2 = cloud(dir, 0.004, 1.6, 0.60) * 0.6;
    float cloudTotal = clamp(c1 + c2, 0.0, 1.0);

    // Cloud shading: lit from the sun direction
    float cloudLight = 0.85 + 0.15 * dot(dir, sunDir);
    vec3 cloudColor = mix(vec3(0.88, 0.93, 1.0), vec3(1.0, 1.0, 1.0), cloudLight);
    // Cloud bottom shadow (anime clouds are darker underneath)
    float bottomShadow = smoothstep(0.0, 0.08, dir.y);
    cloudColor = mix(vec3(0.68, 0.78, 0.92), cloudColor, bottomShadow);

    skyColor = mix(skyColor, cloudColor, cloudTotal);

    gl_FragColor = vec4(skyColor, 1.0);
  }
`;
