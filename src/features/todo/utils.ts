import {
    addWeeks,
    isSameWeek,
    isThisMonth,
    isToday,
    isTomorrow,
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
    this_week: {
        label: "This Week",
        empty: "this week",
    },
    next_week: {
        label: "Next Week",
        empty: "next week",
    },
    this_month: {
        label: "This Month",
        empty: "this month",
    },
} as const;

export type Filter = keyof typeof FILTERS;

export function filterCheck(date: Date, filter: Filter) {
    const now = new Date();

    switch (filter) {
        case "today":
            return isToday(date);

        case "tomorrow":
            return isTomorrow(date);

        case "this_week":
            return isSameWeek(date, now);

        case "next_week":
            return isSameWeek(date, addWeeks(now, 1));

        case "this_month":
            return isThisMonth(date);
    }
}