import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `<div class="spinner-wrap"><mat-spinner diameter="40"></mat-spinner></div>`,
  styles: [`.spinner-wrap { display:flex; justify-content:center; align-items:center; padding:40px; }`]
})
export class LoadingSpinnerComponent {}
