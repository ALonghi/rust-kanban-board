import { Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Fragment } from "react";
import { IToast } from "../../../../model/toast";
import { deleteNotification } from "../../../../stores/notificationStore";
import Utils from "../../../../utils/utils";
import css from "./NotificationToast.module.scss";

interface NotificationToastProps {
  notification: IToast;
}

const NotificationToast: React.VFC<NotificationToastProps> = ({
  notification,
}) => {
  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className={` ${css.bounceFromRight} px-4 md:py-4 py-2 pointer-events-none sm:p-2 z-50 w-full`}
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={true}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className={Utils.classNames(
                notification.type === `success`
                  ? `bg-[#86efac]`
                  : notification.type === `info`
                  ? `bg-yellow-200`
                  : `bg-red-400`,
                "max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
              )}
            >
              <div className="p-3">
                <div className="flex items-center justify-center">
                  <div className="flex-shrink-0">
                    {notification.type === `success` ? (
                      <CheckCircleIcon
                        className="h-6 w-6 text-black-800"
                        aria-hidden="true"
                      />
                    ) : (
                      <ExclamationCircleIcon
                        className="h-6 w-6 text-black-800"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="ml-4 w-0 flex-1 pt-0.5 w-10/12">
                    <p className=" text-sm text-black-900">
                      {notification.details}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      className=" rounded-md inline-flex text-black-900-400 hover:text-black-900-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => {
                        deleteNotification(notification.id);
                      }}
                    >
                      <span className="sr-only">Chiudi</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
};

export default NotificationToast;
