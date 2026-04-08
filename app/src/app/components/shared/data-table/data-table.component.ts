import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export type TableData = { [key: string]: any };

export interface TableColumn {
  name: string;
  key: string;
}

export interface PaginationItem {
  pageNumber: number;
  isActive?: boolean;
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() title: string = '';
  @Input() columns: TableColumn[] = [];
  @Input() data: TableData[] = [];
  @Input() pagination: PaginationItem[] = [];
  @Input() totalPages?: number;
  @Input() clipLongText?: boolean;

  @Output() paginationChange = new EventEmitter<number>();
  @Output() rowClick = new EventEmitter<TableData>();

  activePage = 1;
  displayedPagination: PaginationItem[] = [];

  get displayedColumns(): string[] {
    return this.columns.map((c) => c.key);
  }

  get rowsAreClickable(): boolean {
    return this.rowClick.observed;
  }

  get isPrevDisabled(): boolean {
    return this.activePage === this.pagination[0]?.pageNumber;
  }

  get isNextDisabled(): boolean {
    return this.activePage === this.pagination[this.pagination.length - 1]?.pageNumber;
  }

  ngOnInit(): void {
    this.updatePagination();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pagination'] || changes['totalPages']) {
      this.updatePagination();
    }
  }

  private updatePagination(): void {
    const activePageObj = this.pagination.find((p) => p.isActive);
    if (activePageObj) {
      this.activePage = activePageObj.pageNumber;
    }

    const maxDisplayed = 5;
    let startPage = Math.max(1, this.activePage - Math.floor(maxDisplayed / 2));
    let endPage = Math.min(this.totalPages ?? this.activePage, startPage + maxDisplayed - 1);

    if (endPage - startPage < maxDisplayed - 1) {
      startPage = Math.max(1, endPage - maxDisplayed + 1);
    }

    const newPagination: PaginationItem[] = [];
    for (let i = startPage; i <= endPage; i++) {
      newPagination.push({ pageNumber: i, isActive: i === this.activePage });
    }
    this.displayedPagination = newPagination;
  }

  handlePageClick(pageNumber: number): void {
    this.activePage = pageNumber;
    this.paginationChange.emit(pageNumber);
    this.updatePagination();
  }

  prevPage(): void {
    const idx = this.pagination.findIndex((p) => p.pageNumber === this.activePage);
    if (idx > 0) {
      this.handlePageClick(this.pagination[idx - 1].pageNumber);
    }
  }

  nextPage(): void {
    const idx = this.pagination.findIndex((p) => p.pageNumber === this.activePage);
    if (idx < this.pagination.length - 1) {
      this.handlePageClick(this.pagination[idx + 1].pageNumber);
    }
  }

  onRowClick(row: TableData): void {
    if (this.rowsAreClickable) {
      this.rowClick.emit(row);
    }
  }

  onRowKeyDown(event: KeyboardEvent, row: TableData): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onRowClick(row);
    }
  }

  getCellValue(row: TableData, key: string): string {
    const value = row[key];
    return value !== null && value !== undefined ? String(value) : '\u2014';
  }

  getCellTooltip(row: TableData, key: string): string {
    return row[key] != null ? String(row[key]) : '';
  }
}
