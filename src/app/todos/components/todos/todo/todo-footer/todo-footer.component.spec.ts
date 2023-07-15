import { TodoFooterComponent } from './todo-footer.component'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";

describe('TodoFooterComponent', () => {
  let component: TodoFooterComponent
  let fixture: ComponentFixture<TodoFooterComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TodoFooterComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()

    fixture = TestBed.createComponent(TodoFooterComponent)
    component = fixture.componentInstance
  })

  it('Should create the component', () => {
    expect(component).toBeTruthy();
  })

  it('Should receive the addedDate input', () => {
    const addedDate = '2023-06-30'
    component.addedDate = addedDate;

    fixture.detectChanges()

    expect(component.addedDate).toEqual(addedDate);
  })
})
