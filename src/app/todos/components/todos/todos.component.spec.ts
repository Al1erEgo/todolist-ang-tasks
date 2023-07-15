import {TodosComponent} from "./todos.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {AuthService} from "../../../core/services/auth.service";
import {LoggerService} from "../../../shared/services/logger.service";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {DomainTodo} from "../../models/todos.models";
import {TodosService} from "../../services/todos.service";
import {of} from "rxjs";

describe('TodosComponent', ()=>{
  let component: TodosComponent
  let fixture: ComponentFixture<TodosComponent>
  let authService: AuthService
  let loggerService: LoggerService
  let todosService: TodosService

  const mockTodos: DomainTodo[] = [
    {
      id: '1',
      title: 'Todo 1',
      addedDate: '2023-06-30',
      order: 1,
      filter: 'all',
    },
    {
      id: '2',
      title: 'Todo 2',
      addedDate: '2023-06-30',
      order: 2,
      filter: 'active',
    },
  ]

  beforeEach(async () =>{
    const fakeAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'me'])
    const fakeLoggerService = jasmine.createSpyObj('LoggerService', ['info', 'error', 'warn'])
    const fakeTodosService = jasmine.createSpyObj('TodosService', ['addTodo', 'deleteTodo', 'updateTodoTitle', 'getTodos'])

    await TestBed.configureTestingModule({
      declarations: [TodosComponent],
      providers: [
        {provide: AuthService, useValue: fakeAuthService},
        {provide: LoggerService, useValue: fakeLoggerService},
        {provide: TodosService, useValue: {...fakeTodosService, todos$: of(mockTodos)}},
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents()

    fixture = TestBed.createComponent(TodosComponent)
    component = fixture.componentInstance
    authService = TestBed.inject(AuthService)
    loggerService = TestBed.inject(LoggerService)
    todosService = TestBed.inject(TodosService)
    fixture.detectChanges()
  })

  it('Should be created and call todosService.getTodos()', () => {
    expect(component).toBeTruthy();
    expect(todosService.getTodos).toHaveBeenCalled()
  });

  it('Should call todosService.addTodo and logger.info when addTodoHandler called', () => {
    component.todoTitle = 'New todo';
    component.addTodoHandler();

    expect(todosService.addTodo).toHaveBeenCalledWith('New todo');
    expect(loggerService.info).toHaveBeenCalledWith('Add Todo w/title:', 'TodosComponent','New todo');
    expect(component.todoTitle).toBe('');
  });

  it('Should call todosService.deleteTodo and loggerService.warn when deleteTodo called', () => {
    const todoId = '1';
    component.deleteTodo(todoId);

    expect(todosService.deleteTodo).toHaveBeenCalledWith(todoId);
    expect(loggerService.warn).toHaveBeenCalledWith('Remove todo w/id:', 'TodosComponent', todoId);
  });

  it('Should call todosService.updateTodoTitle and loggerService.warn when editTodo called', () => {
    const data = { todoId: '1', title: 'Updated todo' };
    component.editTodo(data);

    expect(todosService.updateTodoTitle).toHaveBeenCalledWith(data.todoId, data.title);
    expect(loggerService.warn).toHaveBeenCalledWith('Update todo(id) title to:', 'TodosComponent', data);
  });

  it('Should call authService.logout and loggerService.warn when logoutHandler called', () => {
    component.logoutHandler();

    expect(authService.logout).toHaveBeenCalled();
    expect(loggerService.warn).toHaveBeenCalledWith('Logout', 'TodosComponent');
  });
})
