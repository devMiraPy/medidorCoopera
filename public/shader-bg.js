import * as THREE from 'three';

export function initShader() {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Shader baseado no noise e fluido do ShaderGradient original
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    varying vec2 vUv;

    // Função de ruído para o efeito de fumaça/seda
    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float smoothNoise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = noise(i);
      float b = noise(i + vec2(1.0, 0.0));
      float c = noise(i + vec2(0.0, 1.0));
      float d = noise(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
      vec2 st = vUv;
      
      // Distorção para criar o efeito fluido
      float n1 = smoothNoise(st * 2.0 + uTime * 0.1);
      float n2 = smoothNoise(st * 3.0 - uTime * 0.05);
      
      // A curva diagonal (como na imagem)
      float gradient = smoothstep(0.1, 0.8, st.x + st.y + (n1 * 0.5) + (n2 * 0.3));
      
      // Mistura das cores
      vec3 color = mix(color2, color1, gradient); // Preto para Laranja Vermelho
      color = mix(color, color3, smoothstep(0.5, 1.0, gradient) * n2); // Toque de Laranja Queimado
      
      // Adiciona o grão (grain) da imagem original
      float grain = fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
      color += grain * 0.05; // Intensidade do grão

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      color1: { value: new THREE.Color('#0b0b0b') }, // Ember Orange
      color2: { value: new THREE.Color('#000000') }, // Preto profundo
      color3: { value: new THREE.Color('#e96a02') }, // Laranja Secundário
    }
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    material.uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

initShader();