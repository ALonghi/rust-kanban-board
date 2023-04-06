import { nanoid } from "nanoid";

export type ToastType = `success` | `info` | `error`;

export interface IToast {
  id: string;
  details: string;
  type: ToastType;
  duration: number;
}

export const createToast = (details: string, type: ToastType) => {
  const notification: IToast = {
    id: nanoid(16),
    details: details,
    type: type,
    duration: type === "success" ? 3000 : 8000,
  };
  return notification;
};
