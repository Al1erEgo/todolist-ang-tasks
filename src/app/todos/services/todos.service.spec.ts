import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { CommonResponseType } from 'src/app/core/models/core.models';
import {DomainTodo, FilterType, Todo} from 'src/app/todos/models/todos.models';
import { LoggerService } from '../../shared/services/logger.service';
import { TodosService } from './todos.service';

describe('TodosService', () => {
  let service: TodosService;
  let httpMock: HttpTestingController;
  let loggerService: LoggerService;

  beforeEach(() => {
    const fakeLoggerService = jasmine.createSpyObj('LoggerService', ['info', 'error', 'warn'])

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TodosService, {provide: LoggerService, useValue: fakeLoggerService}],
    });
    service = TestBed.inject(TodosService);
    httpMock = TestBed.inject(HttpTestingController);
    loggerService = TestBed.inject(LoggerService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('Should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTodos', () => {
    it('Should fetch todos successfully', () => {
      const response: Todo[] = [
        { id: '1', title: 'Todo 1', addedDate: '2023-07-01', order: 1 },
        { id: '2', title: 'Todo 2', addedDate: '2023-07-02', order: 2 },
      ];

      service.getTodos();
      const req = httpMock.expectOne(`${environment.baseUrl}/todo-lists`);
      expect(req.request.method).toBe('GET');
      req.flush(response);

      expect(service.todos$.value).toEqual([
        { id: '1', title: 'Todo 1', addedDate: '2023-07-01', order: 1, filter: 'all' },
        { id: '2', title: 'Todo 2', addedDate: '2023-07-02', order: 2, filter: 'all' },
      ]);

      expect(loggerService.info).toHaveBeenCalledWith('Todos data requested', 'TodosService');
      expect(loggerService.info).toHaveBeenCalledWith('Todos data received:', 'TodosService', service.todos$.value);
      expect(loggerService.error).not.toHaveBeenCalled();
    });

    it('Should handle error while fetching todos', () => {
      service.getTodos();
      const req = httpMock.expectOne(`${environment.baseUrl}/todo-lists`);
      expect(req.request.method).toBe('GET');
      req.error(new ErrorEvent('Network error'));

      expect(service.todos$.value).toEqual([]);
      expect(loggerService.info).toHaveBeenCalledWith('Todos data requested', 'TodosService');
      expect(loggerService.error).toHaveBeenCalled()
    });
  });

  describe('addTodo', () => {
    it('should add a new todo successfully', () => {
      const title = 'New Todo';
      const response: CommonResponseType<{ item: Todo }> = {
        data: { item: { id: '3', title: 'New Todo', addedDate: '2023-07-03', order: 3 } },
        resultCode: 0,
        messages: [],
      };

      service.addTodo(title);
      const req = httpMock.expectOne(`${environment.baseUrl}/todo-lists`);
      expect(req.request.method).toBe('POST');
      req.flush(response);

      expect(service.todos$.value).toEqual([
        { id: '3', title: 'New Todo', addedDate: '2023-07-03', order: 3, filter: 'all' },
      ]);
      expect(loggerService.info).toHaveBeenCalledWith('Add todo request initialised', 'TodosService');
      expect(loggerService.info).toHaveBeenCalledWith('Todo added:', 'TodosService', {
        ...response.data.item,
        filter: 'all'
      });
      expect(loggerService.error).not.toHaveBeenCalled();
    });

    it('should handle error while adding a todo', () => {
      const title = 'New Todo';

      service.addTodo(title);
      const req = httpMock.expectOne(`${environment.baseUrl}/todo-lists`);
      expect(req.request.method).toBe('POST');
      req.error(new ErrorEvent('Network error'));

      expect(service.todos$.value).toEqual([]);
      expect(loggerService.info).toHaveBeenCalledWith('Add todo request initialised', 'TodosService');
      expect(loggerService.error).toHaveBeenCalled()
    });
  });

  describe('deleteTodo', () => {
    const initialTodos: DomainTodo[] = [
      { id: '1', title: 'Todo 1', addedDate: '2023-07-01', order: 1, filter: 'all' },
      { id: '2', title: 'Todo 2', addedDate: '2023-07-02', order: 2, filter: 'all' },
    ]

    it('Should delete a todo successfully', () => {
      const todoId = '1';
      const response: CommonResponseType = {
        data: {},
        resultCode: 0,
        messages: [],
      };

      service.todos$.next(initialTodos);

      service.deleteTodo(todoId);
      const req = httpMock.expectOne(`${environment.baseUrl}/todo-lists/${todoId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(response);

      expect(service.todos$.value).toEqual([
        { id: '2', title: 'Todo 2', addedDate: '2023-07-02', order: 2, filter: 'all' },
      ]);
      expect(loggerService.info).toHaveBeenCalledWith(
        'Delete todo request initialised, todoId:',
        'TodosService',
        '1'
      );
      expect(loggerService.info).toHaveBeenCalledWith('Todo deleted', 'TodosService', '1');
      expect(loggerService.error).not.toHaveBeenCalled();
    });

    it('Should handle error while deleting a todo', () => {
      const todoId = '1';

      service.todos$.next(initialTodos);

      service.deleteTodo(todoId);
      const req = httpMock.expectOne(`${environment.baseUrl}/todo-lists/${todoId}`);
      expect(req.request.method).toBe('DELETE');
      req.error(new ErrorEvent('Network error'));

      expect(service.todos$.value).toEqual(initialTodos);
      expect(loggerService.info).toHaveBeenCalledWith(
        'Delete todo request initialised, todoId:',
        'TodosService',
        '1'
      );
      expect(loggerService.error).toHaveBeenCalled()
    });
  });

  describe('updateTodoTitle', () => {
    const initialTodos: DomainTodo[] = [
      { id: '1', title: 'Todo 1', addedDate: '2023-07-01', order: 1, filter: 'all' },
      { id: '2', title: 'Todo 2', addedDate: '2023-07-02', order: 2, filter: 'all' },
    ]

    it('Should update a todo title successfully', () => {
      const todoId = '1';
      const newTitle = 'Updated Todo Title';
      const response: CommonResponseType = {
        data: {},
        resultCode: 0,
        messages: [],
      };

      service.todos$.next(initialTodos);

      service.updateTodoTitle(todoId, newTitle);
      const req = httpMock.expectOne(`${environment.baseUrl}/todo-lists/${todoId}`);
      expect(req.request.method).toBe('PUT');
      req.flush(response);

      expect(service.todos$.value).toEqual([
        { id: '1', title: 'Updated Todo Title', addedDate: '2023-07-01', order: 1, filter: 'all' },
        { id: '2', title: 'Todo 2', addedDate: '2023-07-02', order: 2, filter: 'all' },
      ]);
      expect(loggerService.info).toHaveBeenCalledWith(
        'Update todo title request initialised',
        'TodosService',
        { todoId: '1', title: 'Updated Todo Title' }
      );
      expect(loggerService.info).toHaveBeenCalledWith('Todo title updated', 'TodosService');
      expect(loggerService.error).not.toHaveBeenCalled();
    });

    it('Should handle error while updating a todo title', () => {
      const todoId = '1';
      const newTitle = 'Updated Todo Title';

      service.todos$.next(initialTodos);

      service.updateTodoTitle(todoId, newTitle);
      const req = httpMock.expectOne(`${environment.baseUrl}/todo-lists/${todoId}`);
      expect(req.request.method).toBe('PUT');
      req.error(new ErrorEvent('Network error'));

      expect(service.todos$.value).toEqual(initialTodos);
      expect(loggerService.info).toHaveBeenCalledWith(
        'Update todo title request initialised',
        'TodosService',
        { todoId: '1', title: 'Updated Todo Title' }
      );
      expect(loggerService.error).toHaveBeenCalled()
    });
  });

  describe('changeFilter', () => {
    it('Should change the filter for a todo', () => {
      const todoId = '1';
      const filter: FilterType = 'completed';

      service.todos$.next([
        { id: '1', title: 'Todo 1', addedDate: '2023-07-01', order: 1, filter: 'all' },
        { id: '2', title: 'Todo 2', addedDate: '2023-07-02', order: 2, filter: 'all' },
      ]);

      service.changeFilter(todoId, filter);

      expect(service.todos$.value).toEqual([
        { id: '1', title: 'Todo 1', addedDate: '2023-07-01', order: 1, filter: 'completed' },
        { id: '2', title: 'Todo 2', addedDate: '2023-07-02', order: 2, filter: 'all' },
      ]);
      expect(loggerService.info).toHaveBeenCalledWith('Filter changed:', 'TodosService', [
        { id: '1', title: 'Todo 1', addedDate: '2023-07-01', order: 1, filter: 'completed' },
        { id: '2', title: 'Todo 2', addedDate: '2023-07-02', order: 2, filter: 'all' },
      ]);
    });
  });
});
