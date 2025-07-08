import { AfterViewInit, Component, computed, effect, inject, OnInit, viewChild, ViewChild } from '@angular/core';
import { SuperheroService } from '../../../../core/services/superhero.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { JoinArrayPipe } from "../../../../core/pipes/join-array-pipe";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Superhero } from '../../../../core/models/superhero.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-superheroes-list',
  imports: [
    MatTableModule,
    JoinArrayPipe,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule
],
  templateUrl: './superheroes-list.component.html',
  styleUrl: './superheroes-list.component.scss'
})
export class SuperheroesListComponent implements AfterViewInit {
  private _paginator = viewChild.required<MatPaginator>(MatPaginator);
  private _superheroeService = inject(SuperheroService);
  private _router = inject(Router)
  public superheroes = computed(() => this._superheroeService.getSuperheroes())
  dataSource = new MatTableDataSource<Superhero>([])

  displayedColumns: string[] = ['name', 'universe', 'biography', 'powers', 'actions'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.superheroes();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this._paginator();
  }

  viewSuperhero(id: number) {
    this._router.navigate(['/superheroes', id]);
  }

  editSuperhero(id: number) {
    this._router.navigate(['/superheroes', id, 'edit']);
  }

  deleteSuperhero(id: number) {
    this._superheroeService.deleteSuperhero(id);
  }

  addSuperhero() {
    this._router.navigate(['/superheroes', 'new']);
  }
}
