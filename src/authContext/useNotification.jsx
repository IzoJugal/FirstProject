import { useContext } from "react";
import NotificationContext from "../authContext/NotificationContext";

export const useNotification = () => useContext(NotificationContext);



