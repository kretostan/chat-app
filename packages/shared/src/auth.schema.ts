import z from "zod";

export const registerSchema = z
  .object({
    email: z.email("Invalid email"),
    username: z.string().min(3, "Username minimum 3 characters").max(30),
    password: z.string().min(8, "Password minimum 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginFormSchema = z.object({
  username: z.string().min(3, "Username is required").max(30),
  password: z.string().min(8, "Password minimum 8 characters").max(128),
});

export const loginSchema = loginFormSchema.extend({
  deviceName: z.string(),
  sessionUuid: z.string(),
});

export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type LoginValues = z.infer<typeof loginSchema>;

export type AuthValues = RegisterValues | LoginFormValues;

export const changeEmailSchema = z.object({
  email: z.email("Wprowadź poprawny adres e-mail"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Wprowadź obecne hasło"),
    newPassword: z
      .string()
      .min(8, "Hasło musi mieć przynajmniej 8 znaków")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export type ChangeEmailValues = z.infer<typeof changeEmailSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
