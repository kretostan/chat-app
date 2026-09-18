import { type ChangeEvent, useState } from "react";
import type { AuthValues } from "shared";

export const useAuthForm = (initialValues: AuthValues) => {
  const [values, setValues] = useState(initialValues);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return { values, handleChange };
};
