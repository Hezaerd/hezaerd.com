type FormErrorApi = {
  setErrorMap: (errorMap: {
    onSubmit: {
      form?: string;
      fields: Record<string, never>;
    };
  }) => void;
};

export function setFormSubmitError(formApi: FormErrorApi, message: string) {
  formApi.setErrorMap({
    onSubmit: {
      form: message,
      fields: {},
    },
  });
}

export function submitErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
