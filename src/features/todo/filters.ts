import {
    addDays,
    addMonths,
    addWeeks,
    endOfWeek,
    isAfter,
    isBefore,
    isToday,
    isTomorrow,
    startOfDay,
    startOfMonth,
    startOfWeek,
} from "date-fns";

export const FILTERS = {
    today: {
        label: "Today",
        empty: "today",
    },
    tomorrow: {
        label: "Tomorrow",
        empty: "tomorrow",
    },
    later_week: {
        label: "This Week",
        empty: "this week",
    },
    next_week: {
        label: "Next Week",
        empty: "next week",
    },
    later_month: {
        label: "This Month",
        empty: "this month",
    },
} as const;

export type Filter = keyof typeof FILTERS;

export function filterCheck(date: Date, filter: Filter) {
    const now = new Date();
    const tomorrow = startOfDay(addDays(now, 1));
    const endOfThisWeek = endOfWeek(now);
    const startOfNextWeek = startOfWeek(addWeeks(now, 1));
    const endOfNextWeek = endOfWeek(addWeeks(now, 1));
    const startOfFollowingWeek = startOfWeek(addWeeks(now, 2));
    const startOfNextMonth = startOfMonth(addMonths(now, 1));

    switch (filter) {
        case "today":
            return isToday(date);

        case "tomorrow":
            return isTomorrow(date);

        case "later_week":
            return isAfter(date, tomorrow) && isBefore(date, startOfNextWeek);

        case "next_week":
            return isAfter(date, endOfThisWeek) && isBefore(date, startOfFollowingWeek);

        case "later_month":
            return isAfter(date, endOfNextWeek) && isBefore(date, startOfNextMonth);
    }
}