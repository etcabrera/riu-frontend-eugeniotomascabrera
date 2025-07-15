import { Component, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { SuperheroService } from '../../../../core/services/superhero.service';
import { JoinArrayPipe } from "../../../../core/pipes/join-array-pipe";
import { Superhero } from '../../../../core/models/superhero.model';
import { DeleteConfirmDialogComponent } from '../../components/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'app-superheroes-list',
  imports: [
    MatTableModule,
    JoinArrayPipe,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatInputModule
  ],
  templateUrl: './superheroes-list.component.html',
  styleUrl: './superheroes-list.component.scss'
})
export class SuperheroesListComponent implements OnInit {
  private _paginator = viewChild<MatPaginator>(MatPaginator);
  private _dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _superheroService = inject(SuperheroService);
  private _router = inject(Router)

  superheroes = this._superheroService.superheroes;
  dataSource = new MatTableDataSource<Superhero>([])

  displayedColumns: string[] = ['name', 'universe', 'biography', 'powers', 'actions'];

  isLoading = signal(false);
  tableSearchValue = signal('');

  constructor() {
    // Simulate defer loading for data fetching.
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);

    effect(() => {
      this.dataSource.data = this.superheroes();
      const paginator = this._paginator();
      if (paginator) {
        this.dataSource.paginator = paginator;
        this.dataSource.paginator.firstPage();
      }
    });

  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return data.name.toLowerCase().includes(filter);
    };
  }

  viewSuperhero(id: number) {
    this._router.navigate(['/superheroes', id]);
  }

  editSuperhero(id: number) {
    this._router.navigate(['/superheroes', id, 'edit']);
  }

  onDeleteSuperhero(id: number, superheroName: string): void {
    const dialogRef = this._dialog.open(DeleteConfirmDialogComponent, {
      width: '300px',
      data: { name: superheroName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteSuperhero(id);
      }
    });
  }

  deleteSuperhero(id: number) {
    this.isLoading.set(true);
    this._superheroService.deleteSuperhero(id)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: () => {
          this._snackBar.open('✅ Superhero deleted successfully', '', { duration: 5000 });
        },
        error: err => {
          this._snackBar.open('❌ Error deleting superhero', 'Close', { duration: 5000 });
        }
      });
  }

  addSuperhero() {
    this._router.navigate(['/superheroes', 'new']);
  }

  onSearch() {
    const searchedValue = this.tableSearchValue()
    this.dataSource.filter = searchedValue.trim().toLowerCase();
  }
}
