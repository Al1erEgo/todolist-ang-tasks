import { TodoFooterComponent } from './todo-footer.component'
import { ComponentFixture, TestBed } from '@angular/core/testing'

describe('TodoFooterComponent', () => {
  let component: TodoFooterComponent
  let fixture: ComponentFixture<TodoFooterComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TodoFooterComponent],
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
