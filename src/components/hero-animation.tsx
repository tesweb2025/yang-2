
"use client";

import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

function Stars(props: any) {
  const ref = useRef<any>();
  const [sphere,_] = useMemo(() => {
    const sphere = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
        const i3 = i * 3;
        const r = 2 + Math.random() * 4;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        sphere[i3] = r * Math.sin(phi) * Math.cos(theta);
        sphere[i3+1] = r * Math.sin(phi) * Math.sin(theta);
        sphere[i3+2] = r * Math.cos(phi);
    }
    return [sphere, null];
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 25;
      ref.current.rotation.y -= delta / 20;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled {...props}>
        <PointMaterial
          transparent
          color="#4285F4"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export function HeroAnimation() {
  return (
    <Canvas camera={{ position: [0, 0, 1] }}>
        <Stars />
    </Canvas>
  );
}
