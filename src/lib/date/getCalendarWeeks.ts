import { eachWeekOfInterval } from "date-fns";
import { getFirstWeek } from "./getFirstWeek";
import { getLastWeek } from "./getLastWeek";

export function getCalendarWeeks(selectedMonth: Date, weekStartsOn: 0 | 1) {
    const start = getFirstWeek(selectedMonth, weekStartsOn);
    const end = getLastWeek(selectedMonth, weekStartsOn);
    return eachWeekOfInterval({ start, end }, { weekStartsOn });
}
