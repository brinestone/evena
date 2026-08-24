import { defineHandler } from 'nitro';
import { auth } from '~/utils/auth';

export default defineHandler((event) => {
  return auth.handler(event.req);
});
