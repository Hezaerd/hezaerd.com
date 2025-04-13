// simple blank page to test the shining stars

import ShiningStars from "@/components/ui/shining-stars";

export default function Blank() {
  return (
    <div className="flex h-screen flex-col">
      <ShiningStars
        starImages={["/shining-stars/star.png", "/shining-stars/point.png"]}
      />
    </div>
  );
}
