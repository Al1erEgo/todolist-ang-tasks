import {TasksService} from "./tasks.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {LoggerService} from "../../shared/services/logger.service";
import {TestBed} from "@angular/core/testing";
import {GetTasksResponse, UpdateTaskRequest} from "../models/tasks.models";
import {environment} from "../../../environments/environment.prod";
import {CommonResponseType} from "../../core/models/core.models";
import { Task} from "../models/tasks.models";
import {ResultCodeEnum} from "../../core/enums/resultCode.enum";


describe('TasksService', ()=>{
  let service: TasksService
  let httpMock: HttpTestingController
  let loggerService: LoggerService

  beforeEach(()=>{
    const fakeLoggerService = jasmine.createSpyObj('LoggerService', ['info', 'error', 'warn'])

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TasksService,
        {provide: LoggerService, useValue: fakeLoggerService},
      ]
    })
    service = TestBed.inject(TasksService);
    httpMock = TestBed.inject(HttpTestingController);
    loggerService = TestBed.inject(LoggerService);
  })

  afterEach(() => {
    httpMock.verify();
  });

  it('Should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should have initial tasks$', () => {
    expect(service.tasks$).toBeDefined();
  });

  describe('getTasks', () => {
    const todoId = 'todoId';

    it('should retrieve tasks successfully', () => {
      const response: GetTasksResponse = {
        items: [
          { id: '1', title: 'Task 1', todoListId: '1', order: 1, addedDate: '2023-06-29', description: 'Task 1 description', completed: false, status: 0, priority: 0, startDate: '', deadline: '' },
          { id: '2', title: 'Task 2', todoListId: '1', order: 2, addedDate: '2023-06-30', description: 'Task 2 description', completed: false, status: 0, priority: 0, startDate: '', deadline: '' }
        ],
        totalCount: 2,
        error: ''
      };

      service.getTasks(todoId);
      const req = httpMock.expectOne(`${environment.baseUrl}/todo-lists/${todoId}/tasks`);
      expect(req.request.method).toBe('GET');
      req.flush(response);

      expect(service.tasks$.value[todoId]).toEqual(response.items);
      expect(loggerService.info).toHaveBeenCalledWith(
        'Tasks data requested for todo(id):',
        'TasksService',
        todoId
      );
      expect(loggerService.info).toHaveBeenCalledWith(
        'Tasks data received:',
        'TasksService',
        response.items
      );
      expect(loggerService.error).not.toHaveBeenCalled();
    });

    it('should handle error while retrieving tasks', () => {
      const error = new ErrorEvent('Server error');

      service.getTasks(todoId);
      const req = httpMock.expectOne(`${environment.baseUrl}/todo-lists/${todoId}/tasks`);
      expect(req.request.method).toBe('GET');
      req.error(error);

      expect(service.tasks$.value[todoId]).toBeFalsy()
      expect(loggerService.info).toHaveBeenCalledWith(
        'Tasks data requested for todo(id):',
        'TasksService',
        todoId
      );
      expect(loggerService.error).toHaveBeenCalled()
    });
  });

  describe('addTask', () => {
    const todoId = 'todoId';
    const title = 'New Task';

    it('Should add a new task successfully', () => {
      service.tasks$.next({todoId: []})
      const response: CommonResponseType<{ item: Task }> = {
        data: { item:  { id: '3', title: 'New Task', todoListId: '1', order: 2, addedDate: '2023-06-30', description: 'Task 3 description', completed: false, status: 0, priority: 0, startDate: '', deadline: '' } },
        resultCode: ResultCodeEnum.success,
        messages: []
      };

      service.addTask(todoId, title);
      const req = httpMock.expectOne(`${environment.baseUrl}/todo-lists/${todoId}/tasks`);
      expect(req.request.method).toBe('POST');
      req.flush(response);

      expect(service.tasks$.value[todoId]).toEqual([response.data.item]);
      expect(loggerService.info).toHaveBeenCalledWith('Add task request initialised', 'TasksService');
      expect(loggerService.info).toHaveBeenCalledWith('Task added', 'TasksService', title);
      expect(loggerService.error).not.toHaveBeenCalled();
    });

    it('should handle error while adding a task', () => {
      const error = new ErrorEvent('Server error');

      service.addTask(todoId, title);
      const req = httpMock.expectOne(`${environment.baseUrl}/todo-lists/${todoId}/tasks`);
      expect(req.request.method).toBe('POST');
      req.error(error);

      expect(service.tasks$.value[todoId]).toBeFalsy();
      expect(loggerService.info).toHaveBeenCalledWith('Add task request initialised', 'TasksService');
      expect(loggerService.error).toHaveBeenCalled()
    });
  });

  describe('deleteTask', () => {
    const todoId = 'todoId';
    const taskId = '3';
    const task = { id: '3', title: 'New Task', todoListId: '1', order: 2, addedDate: '2023-06-30', description: 'Task 3 description', completed: false, status: 0, priority: 0, startDate: '', deadline: '' }

    it('Should delete a task successfully', () => {
      service.tasks$.next({
        'todoId': [task]
      })
      const response = {};

      service.deleteTask(todoId, taskId);
      const req = httpMock.expectOne(`${environment.baseUrl}/todo-lists/${todoId}/tasks/${taskId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(response);

      expect(service.tasks$.value[todoId]).toEqual([]);
      expect(loggerService.info).toHaveBeenCalledWith(
        'Delete task request initialised, taskId:',
        'TasksService',
        taskId
      );
      expect(loggerService.info).toHaveBeenCalledWith('Task deleted', 'TasksService');
      expect(loggerService.error).not.toHaveBeenCalled();
    });

    it('Should handle error while deleting a task', () => {
      const tasks = {
        'todoId': [task]
      }
      service.tasks$.next(tasks)

      const error = new ErrorEvent('Server error');

      service.deleteTask(todoId, taskId);
      const req = httpMock.expectOne(`${environment.baseUrl}/todo-lists/${todoId}/tasks/${taskId}`);
      expect(req.request.method).toBe('DELETE');
      req.error(error);

      expect(service.tasks$.value[todoId]).toEqual([task]);
      expect(loggerService.info).toHaveBeenCalledWith(
        'Delete task request initialised, taskId:',
        'TasksService',
        taskId
      );
      expect(loggerService.error).toHaveBeenCalled()
    });
  });

  describe('updateTask', () => {
    const todoId = 'todoId';
    const taskId = 'taskId';
    const newTask: UpdateTaskRequest = {
      title: 'Updated Task',
      description: 'Updated description',
      completed: true,
      status: 1,
      priority: 1,
      startDate: '2023-07-01',
      deadline: '2023-07-07'
    };
    const oldTask = {
      id: taskId,
      title: 'Not Updated Task',
      todoListId: '1',
      order: 2,
      addedDate: '2023-06-30',
      description: 'Updated description',
      completed: true,
      status: 1,
      priority: 1,
      startDate: '2023-07-01',
      deadline: '2023-07-07'
    }

    it('Should update a task successfully', () => {
      service.tasks$.next({todoId: [oldTask]})
      const response: CommonResponseType<{ item: Task }> = {
        data: { item: {
            id: taskId,
            title: 'Updated Task',
            todoListId: '1',
            order: 2,
            addedDate: '2023-06-30',
            description: 'Updated description',
            completed: true,
            status: 1,
            priority: 1,
            startDate: '2023-07-01',
            deadline: '2023-07-07'
          } },
        resultCode: 0,
        messages: []
      };

      service.updateTask(todoId, taskId, newTask);
      const req = httpMock.expectOne(
        `${environment.baseUrl}/todo-lists/${todoId}/tasks/${taskId}`
      );
      expect(req.request.method).toBe('PUT');
      req.flush(response);

      expect(service.tasks$.value[todoId]).toEqual([response.data.item]);
      expect(loggerService.info).toHaveBeenCalledWith(
        'Update task request initialised',
        'TasksService',
        newTask
      );
      expect(loggerService.info).toHaveBeenCalledWith('Task updated', 'TasksService');
      expect(loggerService.error).not.toHaveBeenCalled();
    });

    it('Should handle error while updating a task', () => {
      service.tasks$.next({todoId: [oldTask]})
      const error = new ErrorEvent('Server error');

      service.updateTask(todoId, taskId, newTask);
      const req = httpMock.expectOne(
        `${environment.baseUrl}/todo-lists/${todoId}/tasks/${taskId}`
      );
      expect(req.request.method).toBe('PUT');
      req.error(error);

      expect(service.tasks$.value[todoId]).toEqual([oldTask]);
      expect(loggerService.info).toHaveBeenCalledWith(
        'Update task request initialised',
        'TasksService',
        newTask
      );
      expect(loggerService.error).toHaveBeenCalled()
    });
  });
})
