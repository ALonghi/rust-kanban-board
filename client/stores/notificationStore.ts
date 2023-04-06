import { atom } from "nanostores";
import { IToast } from "../model/toast";
import Logger from "@utils/logging";

export const notifications = atom<IToast[]>([]);

export function addNotification(toast: IToast) {
  if (toast.type === "error") Logger.error(toast.details);
  notifications.set([...notifications.get(), toast]);
  setTimeout(() => {
    notifications.set([
      ...notifications.get().filter((t) => t.id !== toast.id),
    ]);
  }, toast.duration);
}

export function deleteNotification(toastId: IToast["id"]) {
  notifications.set(notifications.get().filter((t) => t.id !== toastId));
}
