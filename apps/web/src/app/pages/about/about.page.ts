import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-about',
  styleUrl: './about.page.scss',
  templateUrl: './about.page.html',
})
export class AboutPage {
  protected text = signal(`
    Some really long text lorem ipsum
    `);
}
