import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@hezaerd/ui/components/input-group";
import { cn } from "@hezaerd/ui/lib/utils";
import { Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

type CopyFieldProps = {
  id: string;
  label: string;
  value: string;
  description?: string;
};

const morphTransition =
  "transition-[opacity,filter] duration-200 ease-out motion-reduce:transition-none motion-reduce:filter-none";

function CopyMorphIcon({ copied }: { copied: boolean }) {
  return (
    <span className="relative inline-grid size-3.5 [grid-template-areas:'stack']">
      <HugeiconsIcon
        icon={Copy01Icon}
        size={14}
        aria-hidden={copied}
        className={cn(
          morphTransition,
          "[grid-area:stack]",
          copied ? "pointer-events-none opacity-0 blur-[2px]" : "opacity-100 blur-0",
        )}
      />
      <HugeiconsIcon
        icon={Tick01Icon}
        size={14}
        aria-hidden={!copied}
        className={cn(
          morphTransition,
          "[grid-area:stack]",
          copied ? "opacity-100 blur-0" : "pointer-events-none opacity-0 blur-[2px]",
        )}
      />
    </span>
  );
}

export function CopyField({ id, label, value, description }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {description ? (
        <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
      ) : null}
      <InputGroup>
        <InputGroupInput
          id={id}
          readOnly
          value={value}
          className="font-mono text-xs"
          onFocus={(event) => event.currentTarget.select()}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            size="icon-xs"
            onClick={() => void copy()}
            aria-label={copied ? `${label} copié` : `Copier ${label}`}
            className="transition-transform duration-[var(--duration-press)] ease-out active:scale-[0.97] motion-reduce:active:scale-100"
          >
            <CopyMorphIcon copied={copied} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
