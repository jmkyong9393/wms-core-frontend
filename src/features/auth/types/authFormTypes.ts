export interface LoginFormValues {
  employee_id: string;
  password: string;
}

export interface LoginFieldErrors {
  employee_id?: string;
  password?: string;
}

export type ChangePasswordFormStatus =
  | "idle"
  | "submitting"
  | "success"
  | "error"
  | "unavailable";

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordFieldErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
