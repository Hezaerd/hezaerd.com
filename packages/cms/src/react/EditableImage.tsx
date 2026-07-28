import type { PublishedSnapshot } from "../snapshot.ts";
import { getField } from "../snapshot.ts";

type EditableImageProps = {
  fieldKey: string;
  snapshot: PublishedSnapshot;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
};

export function EditableImage({
  fieldKey,
  snapshot,
  alt,
  className,
  sizes,
  priority,
  width,
  height,
}: EditableImageProps) {
  const src = getField(snapshot, fieldKey);
  if (!src) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      sizes={sizes}
      width={width}
      height={height}
      fetchPriority={priority ? "high" : undefined}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
