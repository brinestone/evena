import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  // events: {
  //   attachments: r.many.EventAttachments({
  //     from: r.EventsTable.id,
  //     to: r.EventAttachments.event,
  //   }),
  // },
  // attachments: {
  //   event: r.one.EventsTable({
  //     from: r.EventAttachments.event,
  //     to: r.EventsTable,
  //   }),
  // },
}));
