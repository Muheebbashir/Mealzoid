import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { useAuthUser } from "./useProfile";
import toast from "react-hot-toast";
import { playNotificationSound } from "../utils/sound";

export const useRealtime = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading, token } = useAuthUser();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !token || !user) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

    socket.on("order:updated", (data: { orderId: string; status: string }) => {
      toast.success(`Order is now ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.orderId] });
    });

    socket.on("order:rider_assigned", (data: { _id?: string; status?: string }) => {
      if (data.status === "delivered") {
        toast.success("Your order has been delivered! 🎉");
      } else {
        toast.success("A rider has been assigned! Your order is on the way 🚴");
      }
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (data._id) {
        queryClient.invalidateQueries({ queryKey: ["order", data._id] });
      }
    });

    socket.on("payment:success", () => {
      toast.success("Payment successful 🎉");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    });

    socket.on("order:new", () => {
      playNotificationSound();
      toast.success("New order received!", { duration: 5000 });
      queryClient.invalidateQueries({ queryKey: ["restaurantOrders"] });
    });

    socket.on("order:available", () => {
      playNotificationSound();
      toast.success("New order nearby!", { duration: 8000 });
      queryClient.invalidateQueries({ queryKey: ["availableOrders"] });
    });

    socket.on("order:taken", () => {
      queryClient.invalidateQueries({ queryKey: ["availableOrders"] });
    });

    socket.on("order:your_delivery", () => {
      queryClient.invalidateQueries({ queryKey: ["currentOrder"] });
      queryClient.invalidateQueries({ queryKey: ["availableOrders"] });
    });

    return () => {
      socket.off("order:updated");
      socket.off("order:rider_assigned");
      socket.off("payment:success");
      socket.off("order:new");
      socket.off("order:available");
      socket.off("order:taken");
      socket.off("order:your_delivery");
    };
  }, [isAuthenticated, isLoading, token, user, queryClient]);
};