import { useContext } from "react";
import NotificationContext, { NotificationContextType } from "./NotificationContext";

export const useNotification = () => {
  return useContext(NotificationContext) as NotificationContextType;
};
