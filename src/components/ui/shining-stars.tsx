"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_STAR_IMAGES = 2;
const MIN_STAR_IMAGES = 1;
const MIN_STAR_COUNT = 10;
const MAX_STAR_COUNT = 50;
const BASE_WIDTH = 1080; // Reference width for scaling
const BASE_HEIGHT = 720; // Reference height for scaling

// Maximum attempts to place a star without collision
const MAX_PLACEMENT_ATTEMPTS = 50;

// Different size ranges for each sprite type
const SPRITE_SIZE = 256;
const SPRITE_1_MIN_SIZE = 10;
const SPRITE_1_MAX_SIZE = 20;
const SPRITE_2_MIN_SIZE = 10; // Larger min size for the second sprite
const SPRITE_2_MAX_SIZE = 15; // Larger max size for the second sprite

// Opacity and animation speed
const MIN_OPACITY = 0;
const MAX_OPACITY = 1;
const MIN_OPACITY_DELTA = 0.3; // Minimum difference between min and max opacity
const MAX_OPACITY_DELTA = 1.0; // Maximum difference between min and max opacity
const MIN_OPACITY_ANIMATION_SPEED = 0.0075;
const MAX_OPACITY_ANIMATION_SPEED = 0.01;

// Movement speed constraints
const MIN_MOVEMENT_AMPLITUDE = 2; // Minimum pixels a star can move from its center
const MAX_MOVEMENT_AMPLITUDE = 10; // Maximum pixels a star can move from its center
const MIN_MOVEMENT_FREQUENCY = 0.00005; // Min oscillation frequency (lower = slower)
const MAX_MOVEMENT_FREQUENCY = 0.0003; // Max oscillation frequency (higher = faster)

// Shooting star settings
const SHOOTING_STAR_CHANCE = 0.0025; // Chance per frame to spawn a shooting star (0.01 = 1%)
const SHOOTING_STAR_MIN_SPEED = 0.1; // Pixels per millisecond
const SHOOTING_STAR_MAX_SPEED = 0.5; // Pixels per millisecond
const SHOOTING_STAR_MIN_SIZE = 1; // Minimum size of shooting star
const SHOOTING_STAR_MAX_SIZE = 3; // Maximum size of shooting star
const SHOOTING_STAR_MIN_LENGTH = 30; // Minimum trail length in pixels
const SHOOTING_STAR_MAX_LENGTH = 150; // Maximum trail length in pixels
const SHOOTING_STAR_TRAIL_POINTS = 50; // Number of points to draw in trail

interface ShiningStarsProps {
  starImages: string[]; // Array of 2 image URLs
}

// Define the Star interface to track each star's properties
interface Star {
  x: number;
  y: number;
  originalX: number; // Original/center position
  originalY: number; // Original/center position
  size: number;
  imageIndex: number;
  opacity: number;
  minOpacity: number; // Individual min opacity for this star
  maxOpacity: number; // Individual max opacity for this star
  speed: number;
  phase: number; // Offset the animation cycle
  direction: 1 | -1; // 1 for increasing opacity, -1 for decreasing
  // Spring movement properties
  amplitudeX: number;
  amplitudeY: number;
  frequency: number;
  movementPhase: number; // Random phase offset for movement
}

// Define the ShootingStar interface
interface ShootingStar {
  x: number; // Current x position
  y: number; // Current y position
  angle: number; // Direction of travel in radians
  speed: number; // Speed in pixels per ms
  size: number; // Size of the shooting star
  trailLength: number; // Length of trail in pixels
  trailPoints: { x: number; y: number; alpha: number }[]; // Trail points with opacity
  progress: number; // 0 to 1, represents progress across screen
}

export default function ShiningStars({ starImages }: ShiningStarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const starsRef = useRef<Star[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const animationFrameIdRef = useRef<number>(0);
  const shootingStarsRef = useRef<ShootingStar[]>([]);

  // Debug mode refs - using refs instead of state to avoid re-renders
  const debugModeRef = useRef(false);
  const [debugModeUI, setDebugModeUI] = useState(false); // Only for UI rendering
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const hoveredStarRef = useRef<Star | null>(null);

  // Update the UI state to match refs (for debug panel only)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [hoveredStar, setHoveredStar] = useState<Star | null>(null);

  // Toggle debug mode function
  const toggleDebugMode = useCallback(() => {
    debugModeRef.current = !debugModeRef.current;
    setDebugModeUI(debugModeRef.current);
  }, []);

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

    // Add keyboard handler to toggle debug mode
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "d" && e.ctrlKey) {
        toggleDebugMode();
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleDebugMode]);

  // Handle mouse movement for debug mode
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Store position in ref
      mousePosRef.current = { x: mouseX, y: mouseY };

      // Only update UI state if debug mode is on (to prevent re-renders when off)
      if (debugModeRef.current) {
        setMousePos(mousePosRef.current);

        // Find the star being hovered (if any)
        const newHoveredStar = starsRef.current.find((star) => {
          const dx = mouseX - star.x;
          const dy = mouseY - star.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance <= star.size / 2;
        });

        hoveredStarRef.current = newHoveredStar || null;
        setHoveredStar(hoveredStarRef.current);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Main canvas setup effect - NO debug dependencies
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

      // Initialize arrays
      starsRef.current = [];
      shootingStarsRef.current = [];

      // Calculate star count based on canvas dimensions
      const canvasArea = dimensions.width * dimensions.height;
      const baseArea = BASE_WIDTH * BASE_HEIGHT;
      const scaleFactor = canvasArea / baseArea;

      // Calculate dynamic star count with min/max constraints
      const dynamicStarCount = Math.floor(MAX_STAR_COUNT * scaleFactor);
      const starCount = Math.max(
        MIN_STAR_COUNT,
        Math.min(MAX_STAR_COUNT, dynamicStarCount),
      );

      for (let i = 0; i < starCount; i++) {
        // Determine which image/sprite to use
        const imageIndex = Math.floor(
          Math.random() * Math.min(images.length, MAX_STAR_IMAGES),
        );

        // Apply different size ranges based on the sprite type
        let minSize, maxSize;

        if (imageIndex === 0) {
          // First sprite
          minSize = SPRITE_1_MIN_SIZE;
          maxSize = SPRITE_1_MAX_SIZE;
        } else {
          // Second sprite
          minSize = SPRITE_2_MIN_SIZE;
          maxSize = SPRITE_2_MAX_SIZE;
        }

        // Get a random target size within the appropriate min/max range for this sprite
        const targetSize = Math.random() * (maxSize - minSize) + minSize;

        // Calculate a clean scale factor based on the target size
        const scaleFactor = getCleanScaleFactor(targetSize);

        // Calculate the actual size using the clean scale factor
        const size = SPRITE_SIZE * scaleFactor;

        // Generate random animation speed
        const animationSpeed =
          Math.random() *
            (MAX_OPACITY_ANIMATION_SPEED - MIN_OPACITY_ANIMATION_SPEED) +
          MIN_OPACITY_ANIMATION_SPEED;

        // Generate random min and max opacity values for this specific star
        // Ensure minOpacity is less than maxOpacity and both are within global range
        const opacityRange = MAX_OPACITY - MIN_OPACITY;

        // First determine the delta (difference between min and max opacity)
        const opacityDelta =
          MIN_OPACITY_DELTA +
          Math.random() * (MAX_OPACITY_DELTA - MIN_OPACITY_DELTA);

        // Calculate min opacity, ensuring we have room for the delta
        const minOpacity =
          MIN_OPACITY + Math.random() * (opacityRange - opacityDelta);

        // Max opacity is min opacity plus the delta
        const maxOpacity = Math.min(MAX_OPACITY, minOpacity + opacityDelta);

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

        // Initial opacity should be within the star's min-max range
        const initialOpacity =
          Math.random() * (maxOpacity - minOpacity) + minOpacity;

        // Generate spring movement parameters
        const amplitude =
          MIN_MOVEMENT_AMPLITUDE +
          Math.random() * (MAX_MOVEMENT_AMPLITUDE - MIN_MOVEMENT_AMPLITUDE);
        const amplitudeX = amplitude * (0.3 + Math.random() * 0.7); // Vary x amplitude
        const amplitudeY = amplitude * (0.3 + Math.random() * 0.7); // Vary y amplitude
        const frequency =
          MIN_MOVEMENT_FREQUENCY +
          Math.random() * (MAX_MOVEMENT_FREQUENCY - MIN_MOVEMENT_FREQUENCY);
        const movementPhase = Math.random() * Math.PI * 2; // Random starting phase for movement

        starsRef.current.push({
          x: x!,
          y: y!,
          originalX: x!,
          originalY: y!,
          size,
          imageIndex,
          opacity: initialOpacity,
          minOpacity,
          maxOpacity,
          speed: animationSpeed,
          phase: Math.random() * Math.PI * 2, // Random starting phase
          direction: Math.random() < 0.5 ? 1 : -1, // Random starting direction
          amplitudeX,
          amplitudeY,
          frequency,
          movementPhase,
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

          // Change direction if opacity reaches star's min or max
          if (star.opacity >= star.maxOpacity) {
            star.opacity = star.maxOpacity;
            star.direction = -1;
          } else if (star.opacity <= star.minOpacity) {
            star.opacity = star.minOpacity;
            star.direction = 1;
          }

          // Update position with spring animation
          const time = currentTime * star.frequency;
          star.x =
            star.originalX +
            Math.sin(time + star.movementPhase) * star.amplitudeX;
          star.y =
            star.originalY +
            Math.cos(time + star.movementPhase) * star.amplitudeY;

          // Draw star with updated opacity
          ctx.globalAlpha = star.opacity;
          ctx.drawImage(
            imagesRef.current[star.imageIndex],
            star.x - star.size / 2,
            star.y - star.size / 2,
            star.size,
            star.size,
          );

          // Draw debug info if debug mode is on and this star is hovered
          // Use refs instead of state to avoid re-renders
          if (debugModeRef.current && hoveredStarRef.current === star) {
            // Draw outline around the hovered star
            ctx.globalAlpha = 1;
            ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size / 2 + 2, 0, Math.PI * 2);
            ctx.stroke();
          }
        });

        // Reset global alpha before drawing shooting stars
        ctx.globalAlpha = 1.0;

        // Check if we should create a new shooting star
        if (Math.random() < SHOOTING_STAR_CHANCE * (deltaTime / 16.67)) {
          createShootingStar();
        }

        // Update and draw shooting stars
        const activeShootingStars: ShootingStar[] = [];
        shootingStarsRef.current.forEach((shootingStar) => {
          // Update position
          const distance = shootingStar.speed * deltaTime;
          shootingStar.x += Math.cos(shootingStar.angle) * distance;
          shootingStar.y += Math.sin(shootingStar.angle) * distance;

          // Update progress based on position relative to screen dimensions
          const screenDiagonal = Math.sqrt(
            dimensions.width * dimensions.width +
              dimensions.height * dimensions.height,
          );
          shootingStar.progress += distance / screenDiagonal;

          // Update trail points
          shootingStar.trailPoints.unshift({
            x: shootingStar.x,
            y: shootingStar.y,
            alpha: 1.0, // Start with full opacity
          });

          // Keep only the needed number of trail points
          if (shootingStar.trailPoints.length > SHOOTING_STAR_TRAIL_POINTS) {
            shootingStar.trailPoints = shootingStar.trailPoints.slice(
              0,
              SHOOTING_STAR_TRAIL_POINTS,
            );
          }

          // Calculate trail fade based on position
          const totalPoints = shootingStar.trailPoints.length;
          shootingStar.trailPoints.forEach((point, index) => {
            // Fade based on index (further back = more faded)
            point.alpha = 1 - index / totalPoints;
          });

          // Draw the shooting star and its trail
          drawShootingStar(ctx, shootingStar);

          // Keep if still on screen and not finished
          if (
            shootingStar.x >= 0 &&
            shootingStar.x <= dimensions.width &&
            shootingStar.y >= 0 &&
            shootingStar.y <= dimensions.height &&
            shootingStar.progress < 1
          ) {
            activeShootingStars.push(shootingStar);
          }
        });

        // Update the array with only active shooting stars
        shootingStarsRef.current = activeShootingStars;

        // Request next frame
        animationFrameIdRef.current = requestAnimationFrame(animate);
      };

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    // Create a new shooting star with random properties
    const createShootingStar = () => {
      // Choose a side of the screen to start from (0=top, 1=right, 2=bottom, 3=left)
      const side = Math.floor(Math.random() * 4);
      let x, y, angle;

      // Position and angle based on starting side
      switch (side) {
        case 0: // Top
          x = Math.random() * dimensions.width;
          y = 0;
          angle =
            Math.PI / 2 +
            ((Math.random() * Math.PI) / 4) * (Math.random() < 0.5 ? -1 : 1);
          break;
        case 1: // Right
          x = dimensions.width;
          y = Math.random() * dimensions.height;
          angle =
            Math.PI +
            ((Math.random() * Math.PI) / 4) * (Math.random() < 0.5 ? -1 : 1);
          break;
        case 2: // Bottom
          x = Math.random() * dimensions.width;
          y = dimensions.height;
          angle =
            (Math.PI * 3) / 2 +
            ((Math.random() * Math.PI) / 4) * (Math.random() < 0.5 ? -1 : 1);
          break;
        case 3: // Left
        default:
          x = 0;
          y = Math.random() * dimensions.height;
          angle =
            ((Math.random() * Math.PI) / 4) * (Math.random() < 0.5 ? -1 : 1);
          break;
      }

      // Create the shooting star
      const shootingStar: ShootingStar = {
        x,
        y,
        angle,
        speed:
          SHOOTING_STAR_MIN_SPEED +
          Math.random() * (SHOOTING_STAR_MAX_SPEED - SHOOTING_STAR_MIN_SPEED),
        size:
          SHOOTING_STAR_MIN_SIZE +
          Math.random() * (SHOOTING_STAR_MAX_SIZE - SHOOTING_STAR_MIN_SIZE),
        trailLength:
          SHOOTING_STAR_MIN_LENGTH +
          Math.random() * (SHOOTING_STAR_MAX_LENGTH - SHOOTING_STAR_MIN_LENGTH),
        trailPoints: [],
        progress: 0,
      };

      shootingStarsRef.current.push(shootingStar);
    };

    // Draw a shooting star and its trail
    const drawShootingStar = (
      ctx: CanvasRenderingContext2D,
      shootingStar: ShootingStar,
    ) => {
      // Ensure alpha is 1.0 for shooting stars (no blinking)
      ctx.globalAlpha = 1.0;

      // Draw the trail using gradient lines
      if (shootingStar.trailPoints.length > 1) {
        for (let i = 0; i < shootingStar.trailPoints.length - 1; i++) {
          const point = shootingStar.trailPoints[i];
          const nextPoint = shootingStar.trailPoints[i + 1];

          // Create gradient for trail
          const gradient = ctx.createLinearGradient(
            point.x,
            point.y,
            nextPoint.x,
            nextPoint.y,
          );

          gradient.addColorStop(0, `rgba(255, 255, 255, ${point.alpha})`);
          gradient.addColorStop(1, `rgba(255, 255, 255, ${nextPoint.alpha})`);

          ctx.beginPath();
          ctx.strokeStyle = gradient;
          ctx.lineWidth =
            shootingStar.size * (1 - i / shootingStar.trailPoints.length);
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(nextPoint.x, nextPoint.y);
          ctx.stroke();
        }
      }

      // Draw the shooting star (head)
      ctx.beginPath();
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.arc(
        shootingStar.x,
        shootingStar.y,
        shootingStar.size,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    };

    loadStars();

    // Cleanup animation when component unmounts or dimensions change
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [dimensions, starImages]); // Removed debug dependencies

  // Format floating point numbers to 2 decimal places
  const formatNumber = (num: number) => {
    return Math.round(num * 100) / 100;
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed left-0 top-0 -z-10 h-full w-full"
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
      />

      {/* Debug information overlay - use debugModeUI state for rendering */}
      {debugModeUI && (
        <div className="fixed left-4 top-4 z-50 rounded-md bg-black/70 p-4 font-mono text-xs text-white">
          <div className="mb-2 flex justify-between">
            <span>Debug Mode (Ctrl+D to toggle)</span>
            <button
              onClick={toggleDebugMode}
              className="ml-4 text-red-400 hover:text-red-300"
            >
              Close
            </button>
          </div>

          <div className="mb-2">
            <div>Stars: {starsRef.current.length}</div>
            <div>
              Canvas: {dimensions.width}x{dimensions.height}
            </div>
            {mousePos && (
              <div>
                Mouse: x={mousePos.x}, y={mousePos.y}
              </div>
            )}
          </div>

          {hoveredStar ? (
            <div className="border-t border-gray-600 pt-2">
              <div className="mb-1 font-bold">Star Info:</div>
              <div>
                Position: x={formatNumber(hoveredStar.x)}, y=
                {formatNumber(hoveredStar.y)}
              </div>
              <div>Size: {formatNumber(hoveredStar.size)}px</div>
              <div>Image: {hoveredStar.imageIndex}</div>
              <div>
                Opacity: {formatNumber(hoveredStar.opacity)} (
                {formatNumber(hoveredStar.minOpacity)} -{" "}
                {formatNumber(hoveredStar.maxOpacity)})
              </div>
              <div>Speed: {formatNumber(hoveredStar.speed)}</div>
              <div>
                Direction:{" "}
                {hoveredStar.direction > 0 ? "Increasing" : "Decreasing"}
              </div>
              <div>
                Movement: Amplitude X={formatNumber(hoveredStar.amplitudeX)}, Y=
                {formatNumber(hoveredStar.amplitudeY)}, Freq=
                {formatNumber(hoveredStar.frequency)}
              </div>
            </div>
          ) : (
            <div className="italic opacity-50">
              Hover over a star to see its stats
            </div>
          )}
        </div>
      )}
    </>
  );
}
