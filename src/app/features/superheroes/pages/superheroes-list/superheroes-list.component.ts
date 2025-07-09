import { Router } from '@angular/router';
import { AfterViewInit, Component, computed, effect, inject, OnInit, signal, viewChild, WritableSignal } from '@angular/core';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

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
export class SuperheroesListComponent implements AfterViewInit, OnInit {
  private _paginator = viewChild.required<MatPaginator>(MatPaginator);
  private _dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _superheroeService = inject(SuperheroService);
  private _router = inject(Router)
  
  superheroes = computed(() => this._superheroeService.superheroes())
  dataSource = new MatTableDataSource<Superhero>([])

  displayedColumns: string[] = ['name', 'universe', 'biography', 'powers', 'actions'];

  isLoading = signal(false);
  tableSearchValue = signal('');

  constructor() {
    effect(() => {
      this.dataSource.data = this.superheroes();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = function(data, filter: string): boolean {
      return data.name.toLowerCase().includes(filter);
    };
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

  onSearch(){ 
    const searchedValue = this.tableSearchValue()
    this.dataSource.filter = searchedValue.trim().toLowerCase();
  }
}
