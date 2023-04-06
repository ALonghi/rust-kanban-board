import {atom} from "nanostores";
import {IToast} from "../model/toast";

export const notifications = atom<IToast[]>([]);

export function addNotification(toast: IToast) {
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
