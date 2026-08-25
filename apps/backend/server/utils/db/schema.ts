import { and, count, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import {
  alias,
  boolean,
  foreignKey,
  index,
  integer,
  interval,
  jsonb,
  pgEnum,
  pgTable,
  pgView,
  real,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { ulid } from 'ulid';
import { user } from './auth/auth-schema';

export const eventAddress = pgEnum('event_address', ['point', 'text']);
export const eventType = pgEnum('event_type', ['invite_only', 'open']);
export const Events = pgTable(
  'events',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => ulid())
      .notNull(),
    name: text().notNull(),
    description: text(),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
    createdBy: text('created_by').notNull(),
    addressType: eventAddress('address_type').notNull(),
    address: jsonb().default({}),
    tags: text().array().default([]),
    attendeeLimit: integer('attendee_limit'),
    type: eventType().notNull().default('open'),
    ticketCost: integer('ticket_cost'),
    duration: interval(),
    companyLimit: integer('company_limit'),
    startedAt: timestamp('started_at', { mode: 'date' }),
    endedAt: timestamp('ended_at', { mode: 'date' }),
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
      foreignColumns: [Events.id],
    }).onDelete('cascade'),
  ],
);
export const EventReservations = pgTable(
  'event_reservations',
  {
    id: text()
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid()),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
    chargeable: boolean().default(true).notNull(),
    company: integer().default(0).notNull(),
    discount: real().notNull().default(0),
    discountReason: text('discount_reason'),
    userId: text('user_id'),
    reservationCode: varchar('reservation_code', { length: 6 }),
    beneficiaryName: text('beneficiary_name'),
    beneficiaryEmail: text('beneficiary_email'),
    beneficiaryPhone: text('beneficiary_phone'),
    cancelledAt: timestamp('cancelled_at', { mode: 'date' }),
    cancelReason: text('cancel_reason'),
    event: text(),
    attendedAt: timestamp('attended_at', { mode: 'date' }),
  },
  (t) => [
    index().on(t.createdAt),
    index().on(t.updatedAt),
    index().on(t.userId).where(isNotNull(t.userId)),
    index().on(t.reservationCode, t.event).where(isNotNull(t.reservationCode)),
    index().on(t.beneficiaryEmail).where(isNotNull(t.beneficiaryEmail)),
    index().on(t.beneficiaryPhone).where(isNotNull(t.beneficiaryPhone)),
    index().on(t.event),
    foreignKey({
      columns: [t.event],
      foreignColumns: [Events.id],
    }).onDelete('set null'),
    foreignKey({
      columns: [t.userId],
      foreignColumns: [user.id],
    }).onDelete('set null'),
  ],
);

export const EventAttendances = pgTable(
  'event_attendances',
  {
    id: text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => ulid()),
    reservation: text(),
    event: text(),
    attendee: text(),
    company: integer().default(0).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index().on(t.reservation).where(isNotNull(t.reservation)),
    index().on(t.event).where(isNotNull(t.event)),
    index().on(t.attendee).where(isNotNull(t.attendee)),
    index()
      .on(t.reservation, t.event)
      .where(and(isNotNull(t.reservation), isNotNull(t.event))!),
    foreignKey({
      columns: [t.reservation],
      foreignColumns: [EventReservations.id],
    }).onDelete('set null'),
    foreignKey({
      columns: [t.event],
      foreignColumns: [Events.id],
    }).onDelete('set null'),
    foreignKey({
      columns: [t.attendee],
      foreignColumns: [user.id],
    }).onDelete('set null'),
  ],
);

export const eventLookup = pgView('vw_event_lookup').as((q) => {
  const currentAttendances = alias(EventAttendances, 'ca');
  const pendingReservations = alias(EventReservations, 'pr');
  const events = alias(Events, 'e');
  return q
    .select({
      id: events.id,
      name: events.name,
      description: events.description,
      lastModified: events.updatedAt.as('last_modified'),
      startedAt: events.startedAt,
      maxAttendees: events.attendeeLimit,
      attendees: count(currentAttendances.id).as('attendances'),
      ticketCost: events.ticketCost,
      pendingReservations: count(pendingReservations.id).as(
        'pending_reservations',
      ),
      overflow:
        sql<number>`CASE WHEN ${events.attendeeLimit} IS NOT NULL THEN GREATEST(${count(currentAttendances.id)} - ${events.attendeeLimit}, 0) ELSE 0 END`.as(
          'overflow',
        ),
      type: events.type,
      address: events.address,
      addressType: events.addressType,
    })
    .from(events)
    .leftJoin(currentAttendances, ({ id }) => eq(currentAttendances.event, id))
    .leftJoin(pendingReservations, ({ id }) =>
      and(
        eq(pendingReservations.event, id),
        isNull(pendingReservations.cancelledAt),
        isNull(pendingReservations.attendedAt),
      ),
    )
    .groupBy(events.id)
    .orderBy(desc(events.updatedAt), events.id);
});
