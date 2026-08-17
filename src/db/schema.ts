import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, pgEnum, primaryKey } from "drizzle-orm/pg-core";
import { primaryId, timestamps } from "./schema.helper";

export const priorityEnum = pgEnum("priority", ["none", "low", "medium", "high"]);

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(true).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
},
    (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
},
    (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
},
    (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const projects = pgTable("projects", {
    ...primaryId,
    ...timestamps,
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
},
    (table) => [index("projects_user_id_idx").on(table.userId)],
);

export const todos = pgTable("todos", {
    ...primaryId,
    ...timestamps,
    projectId: varchar("project_id", { length: 26 })
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    priority: priorityEnum("priority").default("none").notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    dueDate: timestamp("due_date"),
},
    (table) => [index("todos_project_id_idx").on(table.projectId)],
);

export const labels = pgTable("labels", {
    ...primaryId,
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
},
    (table) => [index("labels_user_id_idx").on(table.userId)],
);

export const todoLabels = pgTable("todo_labels", {
    todoId: varchar("todo_id", { length: 26 })
        .notNull()
        .references(() => todos.id, { onDelete: "cascade" }),
    labelId: varchar("label_id", { length: 26 })
        .notNull()
        .references(() => labels.id, { onDelete: "cascade" }),
},
    (table) => [
        primaryKey({
            columns: [table.todoId, table.labelId],
        }),
        index("todo_labels_label_id_idx").on(table.labelId),
    ],
);

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    projects: many(projects),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

export const projectRelations = relations(projects, ({ one, many }) => ({
    user: one(user, {
        fields: [projects.userId],
        references: [user.id],
    }),
    todos: many(todos),
}));

export const todoRelations = relations(todos, ({ one, many }) => ({
    parentProject: one(projects, {
        fields: [todos.projectId],
        references: [projects.id],
    }),
    todoLabels: many(todoLabels)
}));

export const labelRelations = relations(labels, ({ one, many }) => ({
    user: one(user, {
        fields: [labels.userId],
        references: [user.id],
    }),
    todoLabels: many(todoLabels),
}));

export const todoLabelRelations = relations(todoLabels, ({ one }) => ({
    todo: one(todos, {
        fields: [todoLabels.todoId],
        references: [todos.id],
    }),
    label: one(labels, {
        fields: [todoLabels.labelId],
        references: [labels.id],
    }),
}));

export type Priority = (typeof priorityEnum.enumValues)[number];

export type Todo = typeof todos.$inferSelect;
export type Label = typeof labels.$inferSelect;
export type Project = typeof projects.$inferSelect;

export type TodoWithProject = Todo & { parentProject: Project };
export type TodoWithLabels = Todo & { todoLabels: { label: Label }[] };
export type TodoWithProjectWithLabels = TodoWithProject & TodoWithLabels;
export type ProjectWithTodo = Project & { todos: TodoWithLabels[] };