import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chart-card',
  templateUrl: './chart-card.component.html',
  styleUrls: ['./chart-card.component.css']
})
export class ChartCardComponent {
  @Input() title = '';
  @Input() icon = '';
  @Input() height = 300;
  @Input() loading = false;
}
