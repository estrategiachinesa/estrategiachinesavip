'use client';

import React, { useRef, useEffect } from 'react';

interface ParticleType {
  x: number;
  y: number;
  radius: number;
  color: string;
  isOrbiter: boolean;
  orbitRadius: number;
  angle: number;
  speed: number;
  draw: () => void;
  update: (center: { x: number; y: number }) => void;
}

const CelestialOrbHero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: ParticleType[] = [];
    let animationFrameId: number;
    let autoOrbitAngle = 0;

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        // Use parent dimensions for proper containment
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle implements ParticleType {
      x: number;
      y: number;
      radius: number;
      color: string;
      isOrbiter: boolean;
      orbitRadius: number;
      angle: number;
      speed: number;

      constructor(x: number, y: number, radius: number, color: string, isOrbiter = false) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.isOrbiter = isOrbiter;
        this.orbitRadius = Math.random() * 150 + 100;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.02 + 0.01;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      update(center: { x: number; y: number }) {
        if (this.isOrbiter) {
          this.angle += this.speed;
          this.x = center.x + Math.cos(this.angle) * this.orbitRadius;
          this.y = center.y + Math.sin(this.angle) * this.orbitRadius;
        }
        this.draw();
      }
    }

    const centerPoint = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      targetX: canvas.width / 2,
      targetY: canvas.height / 2,
    };

    const init = () => {
      particles = [];
      particles.push(
        new Particle(centerPoint.x, centerPoint.y, 20, 'rgba(255, 255, 255, 0.9)')
      );
      for (let i = 0; i < 50; i++) {
        particles.push(
          new Particle(
            0,
            0,
            Math.random() * 3 + 1,
            `hsl(${Math.random() * 60 + 200}, 70%, 60%)`,
            true
          )
        );
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Automatic elegant circular movement around the center
      autoOrbitAngle += 0.015;
      centerPoint.targetX = canvas.width / 2 + Math.cos(autoOrbitAngle) * 30;
      centerPoint.targetY = canvas.height / 2 + Math.sin(autoOrbitAngle) * 30;
      
      centerPoint.x += (centerPoint.targetX - centerPoint.x) * 0.05;
      centerPoint.y += (centerPoint.targetY - centerPoint.y) * 0.05;

      particles[0].x = centerPoint.x;
      particles[0].y = centerPoint.y;
      particles[0].draw();

      for (let i = 1; i < particles.length; i++) {
        particles[i].update(centerPoint);
      }
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-black/40">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
};

export default CelestialOrbHero;
