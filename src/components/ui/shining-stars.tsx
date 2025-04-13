"use client";

import { useEffect, useRef, useState } from "react";

const MAX_STAR_IMAGES = 2;
const MIN_STAR_IMAGES = 1;
const STAR_COUNT = 60;
const SPRITE_SIZE = 256;
const MIN_SIZE = 10;
const MAX_SIZE = 20;
const MIN_OPACITY = 0;
const MAX_OPACITY = 0.8;
const MIN_OPACITY_ANIMATION_SPEED = 0.0075;
const MAX_OPACITY_ANIMATION_SPEED = 0.01;
const MAX_PLACEMENT_ATTEMPTS = 50; // Maximum attempts to place a star without collision

interface ShiningStarsProps {
  starImages: string[]; // Array of 2 image URLs
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

export default function ShiningStars({ starImages }: ShiningStarsProps) {
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
      if (starImages.length < MIN_STAR_IMAGES) {
        console.error(
          `ShiningStars requires at least ${MIN_STAR_IMAGES} star image(s)`,
        );
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
        // Find the largest divisor of SPRITE_SIZE that results in a size >= targetSize
        const divisor = Math.max(1, Math.floor(SPRITE_SIZE / targetSize));
        return 1 / divisor;
      };

      // Helper function to check if a new star position would collide with existing stars
      const checkCollision = (
        x: number,
        y: number,
        size: number,
        existingStars: Star[],
      ): boolean => {
        // Calculate a minimum distance between stars based on their sizes
        // Using 0.7 as a factor allows some slight overlap but prevents full collisions
        return existingStars.some((star) => {
          const dx = x - star.x;
          const dy = y - star.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = (size + star.size) * 0.7; // Allow for some overlap
          return distance < minDistance;
        });
      };

      // Initialize stars with random properties and clean scale factors
      starsRef.current = [];

      for (let i = 0; i < STAR_COUNT; i++) {
        // Get a random target size within the min/max range
        const targetSize = Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE;

        // Calculate a clean scale factor based on the target size
        const scaleFactor = getCleanScaleFactor(targetSize);

        // Calculate the actual size using the clean scale factor
        const size = SPRITE_SIZE * scaleFactor;

        // Generate random animation speed
        const animationSpeed =
          Math.random() *
            (MAX_OPACITY_ANIMATION_SPEED - MIN_OPACITY_ANIMATION_SPEED) +
          MIN_OPACITY_ANIMATION_SPEED;

        // Try to find a position without collision
        let x, y;
        let attempts = 0;
        let hasCollision = true;

        // Try several positions until we find one without collision or reach max attempts
        while (hasCollision && attempts < MAX_PLACEMENT_ATTEMPTS) {
          x = Math.random() * dimensions.width;
          y = Math.random() * dimensions.height;
          hasCollision = checkCollision(x, y, size, starsRef.current);
          attempts++;
        }

        // If we couldn't find a position without collision after max attempts, skip this star
        if (hasCollision) {
          continue;
        }

        starsRef.current.push({
          x: x!,
          y: y!,
          size,
          imageIndex: Math.floor(
            Math.random() * Math.min(images.length, MAX_STAR_IMAGES),
          ),
          opacity: Math.random() * (MAX_OPACITY - MIN_OPACITY) + MIN_OPACITY,
          speed: animationSpeed,
          phase: Math.random() * Math.PI * 2, // Random starting phase
          direction: Math.random() < 0.5 ? 1 : -1, // Random starting direction
        });
      }

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
          if (star.opacity >= MAX_OPACITY) {
            star.opacity = MAX_OPACITY;
            star.direction = -1;
          } else if (star.opacity <= MIN_OPACITY) {
            star.opacity = MIN_OPACITY;
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
  }, [dimensions, starImages]);

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
