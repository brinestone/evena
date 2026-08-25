import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { findEventsResource } from '@evena/sdk/api/events/events.resource';
@Component({
  imports: [JsonPipe],
  selector: 'app-events',
  styleUrl: './events.scss',
  templateUrl: './events.html',
})
export class Events {
  protected readonly events = findEventsResource(undefined, { defaultValue: [] });
}
