import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * 3D tilt card — tracks pointer position and rotates the card in 3D space
 * with a soft glare highlight. Falls back gracefully (no tilt) on touch.
 */
export function TiltCard({
  children,
  className,
  max = 10,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setT({
      rx: (0.5 - py) * max * 2,
      ry: (px - 0.5) * max * 2,
      gx: px * 100,
      gy: py * 100,
      active: true,
    });
  };

  const reset = () => setT((s) => ({ ...s, rx: 0, ry: 0, active: false }));

  return (
    <div style={{ perspective: 1100 }} className={className}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        className="relative h-full transform-gpu rounded-2xl"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateX: t.rx,
          rotateY: t.ry,
          scale: t.active ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.6 }}
      >
        {children}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 z-30 rounded-2xl transition-opacity duration-300"
            style={{
              opacity: t.active ? 1 : 0,
              background: `radial-gradient(circle at ${t.gx}% ${t.gy}%, rgba(255,255,255,0.35), transparent 55%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}