type FieldErrorProps = {
  errors: unknown[];
  className?: string;
};

export function FieldError({ errors, className = "text-destructive text-xs" }: FieldErrorProps) {
  const message = errors[0];
  if (message === undefined || message === null) {
    return null;
  }

  return <p className={className}>{String(message)}</p>;
}
