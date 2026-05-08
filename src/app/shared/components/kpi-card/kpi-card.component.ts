import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.css']
})
export class KpiCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() icon = 'star';
  @Input() iconBg = '#E3F2FD';
  @Input() iconColor = '#1565C0';
  @Input() trend: number | null = null;
  @Input() loading = false;
}
