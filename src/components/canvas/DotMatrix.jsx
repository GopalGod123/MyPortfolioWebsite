import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Preload } from "@react-three/drei";

const DotField = ({ gridSize = 180, spacing = 0.08, amplitude = 0.6, speed = 0.25 }) => {
  const pointsRef = useRef();
  const materialRef = useRef();

  const positions = useMemo(() => {
    const total = gridSize * gridSize;
    const arr = new Float32Array(total * 3);
    let i = 0;
    const half = (gridSize - 1) * spacing * 0.5;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        arr[i++] = x * spacing - half; // X
        arr[i++] = 0;                  // Y (animated in shader)
        arr[i++] = y * spacing - half; // Z (use as Y in world space)
      }
    }
    return arr;
  }, [gridSize, spacing]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <points ref={pointsRef} rotation-x={-Math.PI / 2.2} position={[0, -0.2, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        depthWrite={false}
        transparent
        vertexShader={`
          uniform float uTime;
          uniform float uAmp;
          uniform float uSpeed;
          uniform float uScale;
          varying float vH;

          // Simple 2D noise (IQ)
          vec2 hash(vec2 p){ p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) ); return -1.0 + 2.0*fract(sin(p)*43758.5453123); }
          float noise(in vec2 p){
            const float K1 = 0.366025404; // (sqrt(3)-1)/2
            const float K2 = 0.211324865; // (3-sqrt(3))/6
            vec2  i = floor(p + (p.x+p.y)*K1);
            vec2  a = p - i + (i.x+i.y)*K2;
            vec2  o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
            vec2  b = a - o + K2;
            vec2  c = a - 1.0 + 2.0*K2;
            vec3  h = max(0.5-vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);
            vec3  n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)) );
            return dot(n, vec3(70.0));
          }

          void main(){
            vec3 p = position;
            // use xz as plane coords
            float h = noise(vec2(p.x, p.z) * uScale + vec2(uTime * uSpeed, uTime * uSpeed*0.6));
            h += 0.5 * noise(vec2(p.x, p.z) * uScale * 2.0 - vec2(uTime*uSpeed*0.3));
            vH = h;
            p.y = h * uAmp;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float dist = clamp(12.0 / -mv.z, 1.5, 6.0);
            gl_PointSize = dist;
          }
        `}
        fragmentShader={`
          varying float vH;
          void main(){
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            if(d>0.5) discard;
            // gradient by height
            vec3 c1 = vec3(0.09, 0.83, 0.42);
            vec3 c2 = vec3(0.13, 0.68, 0.36);
            vec3 c3 = vec3(0.02, 0.95, 0.55);
            float t = clamp((vH*0.5)+0.5, 0.0, 1.0);
            vec3 col = mix(c2, mix(c1,c3,t), t);
            // soft edge
            float a = smoothstep(0.5, 0.45, d);
            gl_FragColor = vec4(col, a);
          }
        `}
        uniforms={{
          uTime: { value: 0 },
          uAmp: { value: amplitude },
          uSpeed: { value: speed },
          uScale: { value: 1.8 },
        }}
      />
    </points>
  );
};

const DotMatrix = () => {
  return (
    <Canvas camera={{ position: [0, 3.2, 4.6], fov: 50 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.5} />
      <DotField />
      <Preload all />
    </Canvas>
  );
};

export default DotMatrix;


