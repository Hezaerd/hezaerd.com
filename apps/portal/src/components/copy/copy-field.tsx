import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@hezaerd/ui/components/input-group";
import { Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

type CopyFieldProps = {
  id: string;
  label: string;
  value: string;
  description?: string;
};

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
      {description ? <p className="text-muted-foreground text-xs leading-relaxed">{description}</p> : null}
      <InputGroup>
        <InputGroupInput
          id={id}
          readOnly
          value={value}
          className="font-mono text-xs"
          onFocus={(event) => event.currentTarget.select()}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="button" onClick={() => void copy()} aria-label={`Copier ${label}`}>
            <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} size={14} />
            {copied ? "Copié" : "Copier"}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
