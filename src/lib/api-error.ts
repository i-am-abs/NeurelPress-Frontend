interface ApiErrorShape {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const shaped = error as ApiErrorShape;
  return shaped?.response?.data?.message || fallback;
}
