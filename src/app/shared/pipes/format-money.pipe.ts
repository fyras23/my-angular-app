import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatMoney' })
export class FormatMoneyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    const abs = Math.abs(value);
    if (abs >= 1_000_000) {
      return (value / 1_000_000).toFixed(2) + 'M';
    }
    if (abs >= 1_000) {
      return (value / 1_000).toFixed(2) + 'K';
    }
    return value.toString();
  }
}
