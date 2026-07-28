import type { JSX } from "react";

import type { PublishedSnapshot } from "../snapshot.ts";
import { getField } from "../snapshot.ts";

type EditableTextProps = {
  fieldKey: string;
  snapshot: PublishedSnapshot;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
};

export function EditableText({
  fieldKey,
  snapshot,
  as: Tag = "span",
  className,
}: EditableTextProps) {
  const value = getField(snapshot, fieldKey);
  return <Tag className={className}>{value}</Tag>;
}
