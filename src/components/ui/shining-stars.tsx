"use client";

import { useEffect, useRef, useState } from "react";

interface ShiningStarsProps {
  starCount?: number;
  starImages: string[]; // Array of 3 image URLs
  minSize?: number;
  maxSize?: number;
}

export default function ShiningStars({
  starCount = 100,
  starImages,
  minSize = 10,
  maxSize = 30,
}: ShiningStarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Place stars randomly
      for (let i = 0; i < starCount; i++) {
        const x = Math.random() * dimensions.width;
        const y = Math.random() * dimensions.height;
        const size = Math.random() * (maxSize - minSize) + minSize;
        const imageIndex = Math.floor(Math.random() * 3); // Choose one of the 3 images

        // Draw the image centered at its position
        ctx.drawImage(
          images[imageIndex],
          x - size / 2,
          y - size / 2,
          size,
          size,
        );
      }
    };

    loadStars();

    // Only redraw on window resize
    return () => {};
  }, [dimensions, starCount, starImages, minSize, maxSize]);

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
