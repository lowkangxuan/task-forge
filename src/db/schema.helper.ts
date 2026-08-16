import { timestamp, varchar } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

export const primaryId = {
    id: varchar("id", { length: 26 })
        .primaryKey()
        .$defaultFn(() => ulid()),
};

export const timestamps = {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => new Date())
        .notNull(),
}