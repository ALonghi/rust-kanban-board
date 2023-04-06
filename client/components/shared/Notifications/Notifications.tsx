import { useStore } from "@nanostores/react";
import React from "react";
import { IToast } from "../../../model/toast";
import { notifications } from "../../../stores/notificationStore";
import NotificationToast from "./NotificationToast/NotificationToast";

const Notifications: React.FC = () => {
  const toastNotifications = useStore(notifications);

  return (
    <>
      <div
        className={`max-h-max h-min w-[20rem] z-50 fixed inset-0 flex justify-items-start 
                flex-column sm:items-start top-4 right-4 left-auto`}
      >
        {toastNotifications.map((notification: IToast) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
          />
        ))}
      </div>
    </>
  );
};

export default Notifications;
