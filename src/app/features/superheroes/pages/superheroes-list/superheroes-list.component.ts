import { Router } from '@angular/router';
import { AfterViewInit, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { SuperheroService } from '../../../../core/services/superhero.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { JoinArrayPipe } from "../../../../core/pipes/join-array-pipe";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Superhero } from '../../../../core/models/superhero.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteConfirmDialogComponent } from '../../components/delete-confirm-dialog/delete-confirm-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-superheroes-list',
  imports: [
    MatTableModule,
    JoinArrayPipe,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule,
    MatDialogModule,
    MatProgressSpinnerModule
],
  templateUrl: './superheroes-list.component.html',
  styleUrl: './superheroes-list.component.scss'
})
export class SuperheroesListComponent implements AfterViewInit {
  private _paginator = viewChild.required<MatPaginator>(MatPaginator);
  private _dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _superheroeService = inject(SuperheroService);
  private _router = inject(Router)
  public superheroes = computed(() => this._superheroeService.getSuperheroes())
  dataSource = new MatTableDataSource<Superhero>([])

  displayedColumns: string[] = ['name', 'universe', 'biography', 'powers', 'actions'];

  isLoading = signal(false);

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

    this._superheroeService.deleteSuperhero(id).subscribe({
      next: () => {
        this._snackBar.open('✅ Superhero deleted successfully', '', { duration: 5000});
      },
      error: err => {
        this._snackBar.open('❌ Error deleting superhero', 'Close', { duration: 5000});
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  addSuperhero() {
    this._router.navigate(['/superheroes', 'new']);
  }
}
