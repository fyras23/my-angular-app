import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FilterParams } from '../../../core/models/filter.model';

export interface FilterConfig {
  showYear?: boolean;
  showCountry?: boolean;
  showGender?: boolean;
  showCategory?: boolean;
  showDateRange?: boolean;
  showPlayerName?: boolean;
  showVendor?: boolean;
  showRacketType?: boolean;
  showGameLevel?: boolean;
  showPriceRange?: boolean;
  years?: number[];
  countries?: string[];
  genders?: string[];
  categories?: string[];
  vendors?: string[];
  racketTypes?: string[];
  gameLevels?: string[];
  priceMin?: number;
  priceMax?: number;
}

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.css']
})
export class FilterPanelComponent implements OnInit {
  @Input() config: FilterConfig = {};
  @Output() filtersChanged = new EventEmitter<FilterParams>();

  form!: FormGroup;
  isExpanded = true;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      year: [null],
      country: [null],
      gender: [null],
      category: [null],
      date_from: [null],
      date_to: [null],
      player_name: [null],
      vendor: [null],
      racket_type: [null],
      game_level: [null],
      price_min: [this.config.priceMin ?? null],
      price_max: [this.config.priceMax ?? null]
    });
  }

  apply(): void {
    const raw = this.form.value;
    // Build clean params — strip nulls and empty strings
    const params: FilterParams = {};
    Object.entries(raw).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        (params as any)[k] = v;
      }
    });
    this.filtersChanged.emit(params);
  }

  reset(): void {
    this.form.reset({
      price_min: this.config.priceMin ?? null,
      price_max: this.config.priceMax ?? null
    });
    this.filtersChanged.emit({});
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
}
