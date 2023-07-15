import {TodoComponent} from "./todo.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {TodosService} from "../../../services/todos.service";
import {LoggerService} from "../../../../shared/services/logger.service";
import {DomainTodo} from "../../../models/todos.models";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";

describe('TodoComponent', ()=> {
  let component: TodoComponent;
  let fixture: ComponentFixture<TodoComponent>;
  let todosService: TodosService;
  let loggerService: LoggerService;

  const mockTodo: DomainTodo = {
      id: '1',
      title: 'Todo 1',
      addedDate: '2023-06-30',
      order: 1,
      filter: 'all',
    }

  beforeEach(async () => {
    const fakeLoggerService = jasmine.createSpyObj('LoggerService', ['info', 'error', 'warn'])
    const fakeTodosService = jasmine.createSpyObj('TodosService', ['addTodo', 'deleteTodo', 'updateTodoTitle', 'getTodos', 'changeFilter'])

    await TestBed.configureTestingModule({
      declarations: [TodoComponent],
      providers: [
        {provide: LoggerService, useValue: fakeLoggerService},
        {provide: TodosService, useValue: fakeTodosService},
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents()

    fixture = TestBed.createComponent(TodoComponent)
    component = fixture.componentInstance
    loggerService = TestBed.inject(LoggerService)
    todosService = TestBed.inject(TodosService)
    component.todo = mockTodo
    fixture.detectChanges()
  })

  it('Should be created and call logger.info', () => {
    expect(component).toBeTruthy();
    expect(loggerService.info).toHaveBeenCalledWith('Todo component initialised', 'TodoComponent');
  });

  it('Should emit deleteTodoEvent.emit when deleteTodoHandler called', () => {
    const deleteTodoEventSpy = spyOn(component.deleteTodoEvent, 'emit');
    component.deleteTodoHandler();
    expect(deleteTodoEventSpy).toHaveBeenCalledWith('1');
  });

  it('Should activate editMode and set proper title to input field and call logger.info', () => {
    component.activateEditModeHandler();

    expect(component.newTitle).toEqual(component.todo.title);
    expect(component.isEditMode).toBe(true);
    expect(loggerService.info).toHaveBeenCalledWith('Edit mode activated', 'TodoComponent');
  });

  it('Should deactivate editMode and emit editTodoEvent with proper data', () => {
    const editTodoEventSpy = spyOn(component.editTodoEvent, 'emit');

    component.newTitle = 'New todo';
    component.editTitleHandler();

    expect(component.isEditMode).toBe(false);
    expect(editTodoEventSpy).toHaveBeenCalledWith({ todoId: '1', title: 'New todo' });
    expect(loggerService.info).toHaveBeenCalledWith('Edit mode deactivated', 'TodoComponent');
  });

  it('должен вызывать todosService.changeFilter при вызове changeFilter', () => {
    const filter = 'active'
    component.changeFilter(filter);

    expect(todosService.changeFilter).toHaveBeenCalledWith('1', filter);
    expect(loggerService.info).toHaveBeenCalledWith('Filter changed, current filter: ', 'TodoComponent', filter);
  });
})
