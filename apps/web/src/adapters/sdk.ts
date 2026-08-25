import { Provider } from '@angular/core';
import { EventsService } from '@evena/sdk/api/events/events.service';
export function provideEventsSdk(): Provider[] {
  return [{ provide: EventsService, multi: false }];
}
