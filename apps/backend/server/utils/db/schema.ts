import {
  foreignKey,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { ulid } from 'ulid';
import { user } from './auth/auth-schema';

export const eventAddress = pgEnum('event_address', ['point', 'text']);
export const EventsTable = pgTable(
  'events',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => ulid())
      .notNull(),
    name: text().notNull(),
    description: text(),
    createdAt: timestamp({ mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
    createdBy: text().notNull(),
    addressType: eventAddress('address_type').notNull(),
    address: jsonb().default({}),
    tags: text().array().default([]),
  },
  (t) => [
    index().on(t.name),
    index().on(t.createdBy),
    index().on(t.createdAt),
    index().on(t.updatedAt),
    foreignKey({
      columns: [t.createdBy],
      foreignColumns: [user.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
  ],
);
export const eventAttachment = pgEnum('event_attachment_type', [
  'image',
  'video',
  'audio',
]);
export const EventAttachments = pgTable(
  'event_attachments',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => ulid())
      .notNull(),
    resource: text(),
    type: eventAttachment().notNull(),
    event: text().notNull(),
  },
  (t) => [
    index().on(t.event),
    foreignKey({
      columns: [t.event],
      foreignColumns: [EventsTable.id],
    }).onDelete('cascade'),
  ],
);
