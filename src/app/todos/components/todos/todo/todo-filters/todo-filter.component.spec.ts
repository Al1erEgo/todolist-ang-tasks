import { ComponentFixture, TestBed } from '@angular/core/testing';
import {TodoFiltersComponent} from "./todo-filters.component";
import {FilterType} from "../../../../models/todos.models";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";


describe('TodoFiltersComponent', () => {
  let component: TodoFiltersComponent;
  let fixture: ComponentFixture<TodoFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TodoFiltersComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should be created', () => {
    expect(component).toBeTruthy();
  });

  it('Should emit changeFilterEvent with when changeFilterHandler is called', () => {
    const filter: FilterType = 'all';
    spyOn(component.changeFilterEvent, 'emit');

    component.changeFilterHandler(filter);

    expect(component.changeFilterEvent.emit).toHaveBeenCalledWith(filter);
  });

});
