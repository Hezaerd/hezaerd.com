import { Badge } from "@hezaerd/ui/components/badge";
import { Button } from "@hezaerd/ui/components/button";
import { Input } from "@hezaerd/ui/components/input";
import { useState } from "react";

type ExtensionTagsInputProps = {
  value: string[];
  onChange: (extensions: string[]) => void;
  id?: string;
};

export function ExtensionTagsInput({ value, onChange, id }: ExtensionTagsInputProps) {
  const [draft, setDraft] = useState("");
  const wildcard = value.length === 0;

  function addExtension(raw: string) {
    const normalized = raw.trim().toLowerCase().replace(/^\./, "");
    if (!normalized) {
      return;
    }
    if (normalized === "*") {
      onChange([]);
      setDraft("");
      return;
    }
    if (!/^[a-z0-9]+$/.test(normalized)) {
      return;
    }
    if (!value.includes(normalized)) {
      onChange([...value, normalized]);
    }
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {wildcard ? (
          <Badge variant="secondary">Tous fichiers</Badge>
        ) : (
          value.map((extension) => (
            <Badge key={extension} variant="secondary" className="gap-1">
              .{extension}
              <button
                type="button"
                className="hover:text-foreground ml-1"
                onClick={() => onChange(value.filter((item) => item !== extension))}
                aria-label={`Retirer .${extension}`}
              >
                ×
              </button>
            </Badge>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addExtension(draft);
            }
          }}
          placeholder="svg, pdf, glb…"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => addExtension(draft)}>
          Ajouter
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
          Tous
        </Button>
      </div>
    </div>
  );
}

export function formatExtensionsLabel(extensions: string[]): string {
  if (extensions.length === 0) {
    return "Tous fichiers";
  }
  return extensions.map((extension) => `.${extension}`).join(", ");
}
