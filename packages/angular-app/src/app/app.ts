import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LitCard, LitCounter, LitButton } from 'lit-angular-wrappers';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LitCard, LitCounter, LitButton],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angular-app');
  protected readonly count = signal(0);

  onCountChanged(event: any) {
    console.log('Count changed:', event.detail.count);
  }

  onLitCountChanged(event: any) {
    console.log('Lit count changed:', event.detail);
    this.count.set(event.detail?.count || 0);
  }

  onButtonClick() {
    console.log('Stencil button clicked!');
  }

  onLitButtonClick() {
    console.log('Lit button clicked!');
  }
}
