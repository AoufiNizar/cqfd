
import React, { useEffect, useRef, useState } from 'react';
import { Sigma } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Resize handling
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    // Particles config
    const particleCount = Math.min(Math.floor(width * height / 10000), 100);
    const connectionDistance = 150;
    const particles: { x: number; y: number; vx: number; vy: number }[] = [];

    // Init particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2, // Velocity X
        vy: (Math.random() - 0.5) * 2  // Velocity Y
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw particles
      particles.forEach((p, i) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8'; // space-accent
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56, 189, 248, ${1 - dist / connectionDistance})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Sequence timing
    const fadeTimer = setTimeout(() => {
      setOpacity(0);
    }, 2200); // Start fade out at 2.2s

    const removeTimer = setTimeout(() => {
      onComplete();
    }, 2800); // Unmount at 2.8s

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-space-950 flex items-center justify-center transition-opacity duration-700 ease-out"
      style={{ opacity }}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Centered Logo/Text Animation */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="bg-space-800 border-2 border-space-700 p-6 rounded-2xl mb-6 shadow-[0_0_50px_rgba(56,189,248,0.2)]">
          <Sigma className="text-space-accent w-20 h-20" strokeWidth={2} />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-100 tracking-tighter font-mono mb-2">
          CQFD
        </h1>
        <p className="text-space-400 font-medium text-sm tracking-[0.3em] uppercase">Ce Qu'il Fallait Démontrer</p>
      </div>
    </div>
  );
};
