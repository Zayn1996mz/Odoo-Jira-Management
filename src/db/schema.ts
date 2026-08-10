import { pgTable, serial, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export const moduleConfigs = pgTable("module_configs", {
  id: serial("id").primaryKey(),
  moduleName: text("module_name").notNull().default("pm_board"),
  moduleTitle: text("module_title").notNull().default("Project Board"),
  moduleDescription: text("module_description").notNull().default("Jira/Trello-like Project Management"),
  authorName: text("author_name").notNull().default("My Company"),
  stages: jsonb("stages").notNull().default(JSON.stringify([
    { name: "Backlog", sequence: 1, fold: false },
    { name: "To Do", sequence: 2, fold: false },
    { name: "In Progress", sequence: 3, fold: false },
    { name: "In Review", sequence: 4, fold: false },
    { name: "Done", sequence: 5, fold: true },
  ])),
  priorities: jsonb("priorities").notNull().default(JSON.stringify([
    { value: "0", label: "Low" },
    { value: "1", label: "Normal" },
    { value: "2", label: "High" },
    { value: "3", label: "Critical" },
  ])),
  enableTimelog: boolean("enable_timelog").notNull().default(true),
  enableSprints: boolean("enable_sprints").notNull().default(true),
  enableTags: boolean("enable_tags").notNull().default(true),
  enableAttachments: boolean("enable_attachments").notNull().default(true),
  enableComments: boolean("enable_comments").notNull().default(true),
  enableSubtasks: boolean("enable_subtasks").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const downloadLogs = pgTable("download_logs", {
  id: serial("id").primaryKey(),
  configId: serial("config_id").references(() => moduleConfigs.id),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
});
