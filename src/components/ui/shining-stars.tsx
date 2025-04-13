"use client";

import { useEffect, useRef, useState } from "react";

interface ShiningStarsProps {
  starCount?: number;
  starImages: string[]; // Array of 3 image URLs
  minSize?: number;
  maxSize?: number;
  minOpacity?: number;
  maxOpacity?: number;
  animationSpeed?: number;
  spriteSize?: number; // Original size of the star sprites
}

// Define the Star interface to track each star's properties
interface Star {
  x: number;
  y: number;
  size: number;
  imageIndex: number;
  opacity: number;
  speed: number;
  phase: number; // Offset the animation cycle
  direction: 1 | -1; // 1 for increasing opacity, -1 for decreasing
}

export default function ShiningStars({
  starCount = 60,
  starImages,
  minSize = 10,
  maxSize = 20,
  minOpacity = 0.3,
  maxOpacity = 1.0,
  animationSpeed = 0.005,
  spriteSize = 256, // Default sprite size is 256x256
}: ShiningStarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const starsRef = useRef<Star[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const animationFrameIdRef = useRef<number>(0);

  useEffect(() => {
    // Handle initial and window resize dimensions
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to device pixel ratio for better rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Load the star images
    const loadStars = async () => {
      if (starImages.length < 3) {
        console.error("ShiningStars requires at least 3 star images");
        return;
      }

      // Load all images
      const loadImage = (src: string) => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = src;
        });
      };

      const images = await Promise.all(starImages.map(loadImage));
      imagesRef.current = images;

      // Calculate appropriate scale factors for clean downscaling
      const getCleanScaleFactor = (targetSize: number) => {
        // Find the largest divisor of spriteSize that results in a size >= targetSize
        const divisor = Math.max(1, Math.floor(spriteSize / targetSize));
        return 1 / divisor;
      };

      // Initialize stars with random properties and clean scale factors
      starsRef.current = Array.from({ length: starCount }, () => {
        // Get a random target size within the min/max range
        const targetSize = Math.random() * (maxSize - minSize) + minSize;

        // Calculate a clean scale factor based on the target size
        const scaleFactor = getCleanScaleFactor(targetSize);

        // Calculate the actual size using the clean scale factor
        const size = spriteSize * scaleFactor;

        return {
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          size,
          imageIndex: Math.floor(Math.random() * images.length),
          opacity: Math.random() * (maxOpacity - minOpacity) + minOpacity,
          speed: Math.random() * animationSpeed + animationSpeed / 2,
          phase: Math.random() * Math.PI * 2, // Random starting phase
          direction: Math.random() < 0.5 ? 1 : -1, // Random starting direction
        };
      });

      // Start the animation loop
      startAnimation();
    };

    const startAnimation = () => {
      let lastTime = performance.now();

      const animate = (currentTime: number) => {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Clear canvas
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        // Update and draw each star
        starsRef.current.forEach((star) => {
          // Update opacity based on time
          star.opacity += star.speed * star.direction * (deltaTime / 16.67);

          // Change direction if opacity reaches min or max
          if (star.opacity >= maxOpacity) {
            star.opacity = maxOpacity;
            star.direction = -1;
          } else if (star.opacity <= minOpacity) {
            star.opacity = minOpacity;
            star.direction = 1;
          }

          // Draw star with updated opacity
          ctx.globalAlpha = star.opacity;
          ctx.drawImage(
            imagesRef.current[star.imageIndex],
            star.x - star.size / 2,
            star.y - star.size / 2,
            star.size,
            star.size,
          );
        });

        // Request next frame
        animationFrameIdRef.current = requestAnimationFrame(animate);
      };

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    loadStars();

    // Cleanup animation when component unmounts or dependencies change
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [
    dimensions,
    starCount,
    starImages,
    minSize,
    maxSize,
    minOpacity,
    maxOpacity,
    animationSpeed,
    spriteSize,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed left-0 top-0 -z-10 h-full w-full"
      style={{
        width: dimensions.width,
        height: dimensions.height,
      }}
    />
  );
}
