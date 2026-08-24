import { defineRelations } from "drizzle-orm/relations";
import * as schema from "./auth-schema";

export const relations = defineRelations(schema, (r) => ({
  accounts: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  sessions: {
    user: r.one.user({ from: r.session.userId, to: r.user.id }),
  },
  user: {
    sessions: r.many.session(),
    accounts: r.many.account(),
  },
}));
