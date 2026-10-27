import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useReduced } from "@/lib/motion";

const nodes = [
  { label: "AI", color: "#8de8d3", position: [-2.25, 0.85, 0.15] as [number, number, number] },
  { label: "CLOUD", color: "#b9fff0", position: [2.25, 0.7, -0.15] as [number, number, number] },
  { label: "TEST", color: "#f5a06a", position: [-1.8, -1.3, 0.25] as [number, number, number] },
  { label: "SHIP", color: "#ffc08f", position: [1.9, -1.35, 0.2] as [number, number, number] },
];

function PointerRig({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const reduced = useReduced();
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced || !active) return;
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [active, reduced]);

  const connectors = useMemo(
    () => nodes.map((node) => [node.position, [0, 0, 0] as [number, number, number]] as const),
    [],
  );

  useFrame((state, delta) => {
    if (!group.current || reduced || !active) return;
    const targetX = pointer.current.y * 0.16;
    const targetY = pointer.current.x * 0.22;
    group.current.rotation.x += (targetX - group.current.rotation.x) * Math.min(1, delta * 3);
    group.current.rotation.y += (targetY - group.current.rotation.y) * Math.min(1, delta * 3);
    group.current.rotation.z += delta * 0.045;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.7} />
      <pointLight color="#8de8d3" intensity={10} distance={7} position={[0, 0, 2.5]} />
      <pointLight color="#f5a06a" intensity={3.5} distance={5} position={[0, -2, 1]} />

      {connectors.map(([start, end], index) => (
        <Line
          key={nodes[index].label}
          points={[start, end]}
          color={nodes[index].color}
          transparent
          opacity={0.34}
          lineWidth={0.7}
        />
      ))}

      <mesh>
        <icosahedronGeometry args={[0.98, 1]} />
        <meshStandardMaterial
          color="#9aa7ff"
          emissive="#2f7d72"
          emissiveIntensity={0.7}
          metalness={0.72}
          roughness={0.22}
          transparent
          opacity={0.82}
          wireframe
        />
      </mesh>
      <mesh scale={0.72}>
        <icosahedronGeometry args={[0.98, 1]} />
        <meshStandardMaterial
          color="#10152c"
          emissive="#27316e"
          emissiveIntensity={0.5}
          metalness={0.92}
          roughness={0.18}
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh rotation={[0.3, 0.5, 0.1]}>
        <torusGeometry args={[1.36, 0.012, 8, 96]} />
        <meshBasicMaterial color="#8de8d3" transparent opacity={0.62} />
      </mesh>
      <mesh rotation={[1.1, 0.2, 0.6]}>
        <torusGeometry args={[1.55, 0.009, 8, 96]} />
        <meshBasicMaterial color="#f5a06a" transparent opacity={0.44} />
      </mesh>

      {nodes.map((node) => (
        <group key={node.label} position={node.position}>
          <mesh>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color={node.color} />
          </mesh>
          <mesh scale={2.2}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color={node.color} transparent opacity={0.12} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function ReliabilityCore() {
  const reduced = useReduced();
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const element = host.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? true),
      { rootMargin: "160px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const active = visible && !reduced;

  return (
    <div ref={host} className="reliability-core" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6.4], fov: 42 }}
        dpr={[1, 1.25]}
        frameloop={active ? "always" : "demand"}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      >
        <PointerRig active={active} />
      </Canvas>
    </div>
  );
}
