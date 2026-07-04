// Custom GLSL shader for the Uyuni Salt Flat infinite mirror water
// Exactly replicates the anime look: sky reflected in a perfectly flat, shallow water surface

export const WaterVertexShader = /* glsl */`
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  // Smooth noise function
  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y
    );
  }

  void main() {
    vUv = uv;
    vNormal = normal;

    vec3 pos = position;

    // Extremely subtle wave displacement - keeps the flat mirror look
    float wave1 = noise(pos.xz * 0.01 + uTime * 0.15) * 0.8;
    float wave2 = noise(pos.xz * 0.03 - uTime * 0.08) * 0.3;
    float wave3 = noise(pos.xz * 0.08 + uTime * 0.2) * 0.1;
    pos.y += (wave1 + wave2 + wave3) * 0.15; // Very subtle so mirror stays clean

    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const WaterFragmentShader = /* glsl */`
  uniform float uTime;
  uniform vec3 uSkyColorTop;
  uniform vec3 uSkyColorHorizon;
  uniform vec3 uSunColor;
  uniform vec3 uSunDirection;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1,0));
    float c = hash(i + vec2(0,1));
    float d = hash(i + vec2(1,1));
    return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
  }

  // Generate cloud-like shape at a given UV
  float cloudShape(vec2 uv) {
    float n1 = noise(uv * 2.0);
    float n2 = noise(uv * 4.0 + 17.0);
    float n3 = noise(uv * 8.0 + 43.0);
    return clamp(n1 * 0.6 + n2 * 0.3 + n3 * 0.1 - 0.25, 0.0, 1.0);
  }

  void main() {
    // Ripple distortion
    vec2 ripple = vec2(
      noise(vWorldPosition.xz * 0.012 + uTime * vec2(0.09, 0.06)),
      noise(vWorldPosition.xz * 0.012 + uTime * vec2(-0.06, 0.09))
    ) * 0.06;
    ripple += vec2(
      noise(vWorldPosition.xz * 0.035 - uTime * vec2(0.07, -0.04)),
      noise(vWorldPosition.xz * 0.035 + uTime * vec2(0.04, 0.07))
    ) * 0.025;

    // Reflection direction
    vec3 viewDir = normalize(vWorldPosition - cameraPosition);
    vec3 reflNormal = normalize(vec3(ripple.x * 0.5, 1.0, ripple.y * 0.5));
    vec3 reflectDir = reflect(viewDir, reflNormal);

    // Sky gradient in reflection
    float h = clamp((reflectDir.y + 0.05) / 1.05, 0.0, 1.0);
    vec3 reflectedSky = mix(uSkyColorHorizon, uSkyColorTop, pow(h, 0.6));

    // Cloud reflection: sample cloud noise in reflection UV space
    vec2 cloudUV = vWorldPosition.xz * 0.00015 + uTime * 0.01;
    float cloud1 = cloudShape(cloudUV + vec2(0.0));
    float cloud2 = cloudShape(cloudUV * 1.4 + vec2(3.7, 1.2));
    float cloud3 = cloudShape(cloudUV * 0.7 + vec2(-2.1, 4.5));
    float cloudMask = clamp(cloud1 * 0.5 + cloud2 * 0.35 + cloud3 * 0.25, 0.0, 1.0);
    // Clouds only appear in the sky half of the reflection
    cloudMask *= clamp(h * 3.0, 0.0, 1.0);
    vec3 cloudColor = vec3(0.95, 0.97, 1.0); // Pure white clouds
    reflectedSky = mix(reflectedSky, cloudColor, cloudMask);

    // Sun disc reflected
    float sunDot = max(dot(normalize(reflectDir), normalize(uSunDirection)), 0.0);
    float sunDisc = pow(sunDot, 400.0) * 4.0;
    float sunGlow = pow(sunDot, 30.0) * 0.4;
    vec3 sunReflection = uSunColor * (sunDisc + sunGlow);

    // Fresnel — keeps the water highly reflective at grazing angles
    float fresnel = pow(1.0 - max(dot(-viewDir, vec3(0.0, 1.0, 0.0)), 0.0), 2.0);
    fresnel = clamp(fresnel * 1.5 + 0.4, 0.55, 1.0);

    // Base water tint is very light sky blue
    vec3 waterBase = vec3(0.47, 0.78, 1.0);
    vec3 finalColor = mix(waterBase, reflectedSky + sunReflection, fresnel);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
