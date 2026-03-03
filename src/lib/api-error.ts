interface ApiErrorShape {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string>;
    };
  };
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const shaped = error as ApiErrorShape;
  const data = shaped?.response?.data;

  if (data?.errors && typeof data.errors === "object") {
    const details = Object.values(data.errors).filter(Boolean);
    if (details.length > 0) {
      return details.join(" ");
    }
  }

  return data?.message || fallback;
}
