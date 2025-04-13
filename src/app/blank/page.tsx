// simple blank page to test the shining stars

import ShiningStars from "@/components/ui/shining-stars";

export default function Blank() {
  return (
    <div>
      <ShiningStars
        starImages={[
          "/shining-stars/star.png",
          "/shining-stars/point.png",
          "/shining-stars/diamond.png",
        ]}
      />
    </div>
  );
}
