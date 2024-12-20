import { useContext } from "react";
import { EventsProviderContext } from "@/features/calendar/context/events-provider";

export function useEvents() {
    const value = useContext(EventsProviderContext);

    if (value == null) {
        throw new Error("useEvents must be used within an EventsProvider");
    }

    return value;
}
