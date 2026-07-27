import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import { fr as frDateFns } from "date-fns/locale";
import * as React from "react";
import { fr } from "react-day-picker/locale";

import { Calendar } from "@hezaerd/ui/components/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@hezaerd/ui/components/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@hezaerd/ui/components/popover";
import { cn } from "@hezaerd/ui/lib/utils";

type DatePickerProps = {
  id?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Choisir une date",
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <InputGroup className={cn(className)}>
        <PopoverTrigger
          disabled={disabled}
          nativeButton={false}
          render={
            <InputGroupInput
              id={id}
              readOnly
              disabled={disabled}
              value={value ? format(value, "dd/MM/yyyy", { locale: frDateFns }) : ""}
              placeholder={placeholder}
              className="cursor-pointer"
            />
          }
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label="Ouvrir le calendrier"
            disabled={disabled}
            onClick={() => setOpen(true)}
          >
            <HugeiconsIcon icon={Calendar03Icon} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          locale={fr}
          selected={value}
          onSelect={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
