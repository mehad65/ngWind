import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { PaginationComponent } from "../pagination/pagination.component";
import { Datatable } from './data-table.type';
import { AdvanceSearchRequest, Filter, FilterColumn, GeneralSearchRequest, IPagingSearchRequest, PaginateResult, SortOrder, SortOrderType } from './paging.type';
import { Observable, finalize, of } from 'rxjs';
import { HttpClientService } from '../../services/httpClient.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'data-table',
  standalone: true,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
  imports: [NgClass, NgIf, PaginationComponent, CommonModule, SafeHtmlPipe]
})
export class DataTableComponent implements OnInit {
  shorting: boolean = false;

  changePage(event:{pageSize:number, currentPage: number}) {
    if (event) {
      this.currentPageIndex = event.currentPage;
      this.pageSize = event.pageSize;
      this.loadTable();
    }
  }

  @Input() url!: string;
  @Input() setting: Datatable = new Datatable([]);
  @Input() defaultFilters: FilterColumn[] = [];

  pageSize: number = 10;
  isLoading: boolean = true;
  currentPageIndex: number = 1;
  totalRows: number | null = null;
  sortColumns: SortOrder[] = [];
  row$: Observable<any[]> = of([]);
  generalSearchValue: string = "";

  constructor(
    private httpClientService: HttpClientService) {

  }

  ngOnInit(): void {
    this.loadTable();
  }

  onSort(name: string, order: SortOrderType) {
    this.sortColumns = [
      {
        sortBy: name.toLowerCase(),
        order: order
      }
    ];
    console.log(this.sortColumns);
    this.loadTable();
  }

  isSortActive(name: string, order: SortOrderType) {
    const column = this.sortColumns.find(x => x.sortBy.toLowerCase() == name.toLowerCase() && x.order == order);
    return column != null;
  }

  public onAdvanceSearch(filters: FilterColumn[]) {
    this.defaultFilters = filters;
    this.currentPageIndex = 1;
    this.loadTable();
  }

  onGeneralSearch(value: string) {
    this.currentPageIndex = 1;
    this.generalSearchValue = value;
    this.loadTable();
  }

  reloadTable() {
    this.currentPageIndex = 1;
    this.generalSearchValue = '';
    this.loadTable();
  }

  loadTable() {
    let request: IPagingSearchRequest = {
      pageIndex: this.currentPageIndex,
      pageSize: this.pageSize,
      sortOrders: this.sortColumns
    };

      request = new AdvanceSearchRequest(
        request.pageIndex,
        request.pageSize,
        request.sortOrders,
        this.defaultFilters);

    this.isLoading = true;
    this.httpClientService.post<PaginateResult<any>>(this.url, request)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(response => {
        if (response) {
          this.row$ = of(response.items);
          this.totalRows = response.totalFiltered;
        }
      });
  }
}
