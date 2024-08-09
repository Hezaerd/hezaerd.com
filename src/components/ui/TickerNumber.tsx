import { cn } from "@/lib/utils";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface TickerNumberProps {
  /**
   * @required
   * @type number
   * @description
   * The number to be displayed
   * */
  number: number;

  /**
   * @default 0
   * @type number
   * @description
   * The duration in seconds of the animation
   * */
  duration?: number;

  /**
   * @default "up"
   * @type string
   * @description
   * The direction of the animation
   */
  direction?: "up" | "down";

  /**
   * @default false
   * @type boolean
   * @description
   * Play the animation only once
   */
  doOnce?: boolean;

  /**
   * @default ""
   * @type string
   * @description
   * The className of the text
   */
  className?: string;
}

export default function TickerNumber({
  number,
  duration = 2,
  direction = "up",
  doOnce = false,
  className,
}: TickerNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const motionNumber = useMotionValue(direction === "up" ? 0 : number);
  const springNumber = useSpring(motionNumber, {
    damping: 60,
    stiffness: 100,
  });

  const isInView = useInView(ref, { once: true, margin: "0px" });
  const [hasPlayed, setHasPlayed] = useState(false);

  console.log("once", doOnce);
  console.log("hasPlayed", hasPlayed);

  useEffect(() => {
    if (isInView && (!doOnce || !hasPlayed)) {
      setTimeout(() => {
        motionNumber.set(direction === "up" ? number : 0);
        setHasPlayed(true);
        console.log("play");
      }, duration * 1000);
    }
  }, [motionNumber, isInView, duration, number, direction, doOnce, hasPlayed]);

  useEffect(
    () =>
      springNumber.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat("en-US").format(
            Math.round(latest),
          );
        }
      }),
    [springNumber],
  );

  return (
    <span
      className={cn(
        "inline-block tabular-nums tracking-wider text-primary",
        className,
      )}
      ref={ref}
    />
  );
}
