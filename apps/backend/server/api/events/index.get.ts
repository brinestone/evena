import { and, eq, gt, SQL } from 'drizzle-orm';
import { getValidatedQuery } from 'nitro/h3';
import { defineHandler, defineRouteMeta } from 'nitro';
import z from 'zod/v4';
import { eventLookup, Events, useDatabase } from '~/utils/db';
import { ulid } from 'ulid';

const paramsSchema = z.object({
  offset: z.string().trim().nullish().default(null),
  batchSize: z.coerce.number().nullish().default(100),
});

export default defineHandler(async (event) => {
  const db = useDatabase();
  const { batchSize, offset } = await getValidatedQuery(event, paramsSchema);
  const whereClauses = Array<SQL<unknown>>();

  if (offset) whereClauses.push(gt(eventLookup.id, offset));

  const events = await db
    .select()
    .from(eventLookup)
    .where(and(eq(eventLookup.type, 'open'), ...whereClauses))
    .limit(batchSize ?? 100);
  return events;
});

defineRouteMeta({
  openAPI: {
    tags: ['Events'],
    description: 'Finds public events or user-owned events',
    operationId: 'findEvents',
    summary: 'Find Events',
    parameters: [
      {
        in: 'query',
        name: 'offset',
        required: false,
        schema: { type: 'string', format: 'ulid' },
        description:
          'An offset event ID. The result set will contain events after the ID value specified',
      },
      {
        in: 'query',
        name: 'batchSize',
        required: false,
        description: 'The size of the resultset',
        schema: { type: 'integer', minimum: 1, default: 100 },
      },
    ],
    responses: {
      200: {
        description: 'Events',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                $ref: '#/components/schemas/EventLookup',
                additionalProperties: false,
              },
            },
          },
        },
      },
    },
    $global: {
      components: {
        schemas: {
          EventLookup: {
            type: 'object',
            additionalProperties: false,
            required: [
              'id',
              'currency',
              'type',
              'addressType',
              'updatedAt',
              'createdAt',
              'name',
            ],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: ['string', 'null'] },
              lastModified: { type: 'string', format: 'date-time' },
              startedAt: { type: 'string', format: 'date-time' },
              attendees: { type: 'number' },
              pendingReservations: { type: 'number' },
              maxAttendees: { type: 'number' },
              overflow: { type: 'number' },
              addressType: { type: 'string' },
              address: { type: 'object', additionalProperties: true },
              tags: { type: 'array', items: { type: 'string' } },
              attendeeLimit: { type: ['number', 'null'] },
              type: { type: 'string', enum: ['open', 'invite_only'] },
              ticketCost: { type: ['number', 'null'] },
              currency: { type: 'string' },
            },
          },
        },
      },
    },
  },
});
