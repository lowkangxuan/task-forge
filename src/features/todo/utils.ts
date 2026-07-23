import { isToday, isTomorrow, addWeeks, isSameWeek } from "date-fns";

export type filter = "today" | "tomorrow" | "next week";

export function filterCheck(date: Date, filter: filter) {
    switch (filter) {
        case "today":
            return isToday(date);

        case "tomorrow":
            return isTomorrow(date);

        case "next week":
            const nextWeekDate = addWeeks(new Date(), 1);
            return isSameWeek(date, nextWeekDate);

        default:
            break;
    }
}