import { createContext, useContext, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

type Ctx = { open: (room?: string) => void };
const BookingCtx = createContext<Ctx>({ open: () => {} });
export const useBooking = () => useContext(BookingCtx);

export function BookingProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const open = (room?: string) => {
    navigate({ to: "/book", search: room ? { room } : {} });
  };
  return <BookingCtx.Provider value={{ open }}>{children}</BookingCtx.Provider>;
}
