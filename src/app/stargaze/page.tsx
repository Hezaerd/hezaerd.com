// simple blank page to test the shining stars

import ShiningStars from "@/components/ui/shining-stars";

export default function Blank() {
  return (
    <div className="flex h-screen flex-col">
      <ShiningStars
        starImages={["/shining-stars/star.png", "/shining-stars/point.png"]}
      />

      {/* Content with black background for better readability */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-8">
          {/* Header Section */}
          <div className="rounded-lg bg-black/80 p-8 backdrop-blur-sm">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">
              Stargazing
            </h1>
            <p className="text-lg text-neutral-300 md:text-xl">
              Welcome to the cosmic experience. The stars are shining bright tonight.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-black/80 p-6 backdrop-blur-sm">
              <h3 className="mb-3 text-xl font-semibold text-white">
                Interactive Stars
              </h3>
              <p className="text-neutral-300">
                Move your mouse around to interact with the stars. Each star has unique properties and animations.
              </p>
            </div>

            <div className="rounded-lg bg-black/80 p-6 backdrop-blur-sm">
              <h3 className="mb-3 text-xl font-semibold text-white">
                Shooting Stars
              </h3>
              <p className="text-neutral-300">
                Keep an eye out for shooting stars that occasionally streak across the sky.
              </p>
            </div>
          </div>

          {/* Debug Info */}
          <div className="rounded-lg bg-black/80 p-6 backdrop-blur-sm">
            <h3 className="mb-3 text-xl font-semibold text-white">
              Debug Mode
            </h3>
            <p className="text-neutral-300">
              Press <kbd className="rounded bg-neutral-700 px-2 py-1 text-sm">Ctrl + D</kbd> to toggle debug mode and see star statistics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
