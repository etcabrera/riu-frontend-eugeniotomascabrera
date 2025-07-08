import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperheroesListComponent } from './superheroes-list.component';

describe('SuperheroesList', () => {
  let component: SuperheroesListComponent;
  let fixture: ComponentFixture<SuperheroesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperheroesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperheroesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
