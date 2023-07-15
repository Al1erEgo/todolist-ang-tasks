import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksComponent } from './tasks.component';
import { TasksService } from 'src/app/todos/services/tasks.service';
import { TodosService } from 'src/app/todos/services/todos.service';
import { Task, UpdateTaskRequest } from 'src/app/todos/models/tasks.models';
import { LoggerService } from "../../../../../shared/services/logger.service";
import {TaskStatusEnum} from "../../../../../core/enums/taskStatus.enum";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {of} from "rxjs";
import {FormsModule} from "@angular/forms";

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let tasksService: TasksService;
  let todosService: TodosService;
  let loggerService: LoggerService;

  const mockTasks: { [todoId: string]: Task[] } = {
    '1': [
      {
        id: '1',
        title: 'Task 1',
        description: 'Task description',
        completed: false,
        status: TaskStatusEnum.active,
        priority: 1,
        startDate: '2023-07-01',
        deadline: '2023-07-10',
        order: 1,
        addedDate: '2023-07-01',
        todoListId: '1',
      },
      {
        id: '2',
        title: 'Task 2',
        description: 'Task description',
        completed: true,
        status: TaskStatusEnum.completed,
        priority: 2,
        startDate: '2023-07-02',
        deadline: '2023-07-15',
        order: 2,
        addedDate: '2023-07-02',
        todoListId: '1',
      },
    ],
    '2': [
      {
        id: '3',
        title: 'Task 3',
        description: 'Task description',
        completed: false,
        status: TaskStatusEnum.active,
        priority: 1,
        startDate: '2023-07-03',
        deadline: '2023-07-20',
        order: 1,
        addedDate: '2023-07-03',
        todoListId: '2',
      },
      {
        id: '4',
        title: 'Task 4',
        description: 'Task description',
        completed: true,
        status: TaskStatusEnum.completed,
        priority: 2,
        startDate: '2023-07-04',
        deadline: '2023-07-25',
        order: 2,
        addedDate: '2023-07-04',
        todoListId: '2',
      },
    ],
    '3': [
      {
        id: '0',
        title: 'Task 0',
        description: 'Task description',
        completed: true,
        status: TaskStatusEnum.completed,
        priority: 2,
        startDate: '2023-07-04',
        deadline: '2023-07-25',
        order: 2,
        addedDate: '2023-07-04',
        todoListId: '2',
      },
    ]
  };

  const mockTodos = [
    { id: '1', filter: 'all' },
    { id: '2', filter: 'completed' },
    { id: '3', filter: 'active'}
  ];

  beforeEach(() => {
    const fakeTasksService = jasmine.createSpyObj('TasksService', ['addTask', 'updateTask', 'deleteTask', 'getTasks' ])
    const fakeLoggerService = jasmine.createSpyObj('LoggerService', ['info', 'error', 'warn'])
    const fakeTodosService = jasmine.createSpyObj('TodosService', ['addTodo', 'deleteTodo', 'updateTodoTitle', 'getTodos', 'changeFilter'])

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [TasksComponent],
      providers: [
        { provide: TasksService, useValue: {...fakeTasksService, tasks$: of(mockTasks)} },
        { provide: TodosService, useValue: {...fakeTodosService, todos$: of(mockTodos)} },
        { provide: LoggerService, useValue: fakeLoggerService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
    tasksService = TestBed.inject(TasksService);
    todosService = TestBed.inject(TodosService);
    loggerService = TestBed.inject(LoggerService);
    fixture.detectChanges();
  });

  it('Should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should receive tasks$', () => {
    component.todoId = '1';

    expect(component.tasks$).toBeDefined();
    component.tasks$!.subscribe((tasks) => {
      expect(tasks.length).toBe(2);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[0].status).toBe(TaskStatusEnum.active);
      expect(tasks[1].title).toBe('Task 2');
      expect(tasks[1].status).toBe(TaskStatusEnum.completed);
    });
  });

  it('Should call tasksService.getTasks on ngOnInit and receive proper tasks based on todo id and completed filter', () => {
    component.todoId = '2';
    component.ngOnInit();
    fixture.detectChanges()
    expect(tasksService.getTasks).toHaveBeenCalledWith('2');
    component.tasks$!.subscribe((tasks) => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('Task 4');
      expect(tasks[0].status).toBe(TaskStatusEnum.completed);
    });
  });

  it('Should call tasksService.getTasks on ngOnInit and receive proper tasks based on todo id and active filter', () => {
    component.todoId = '3';
    component.ngOnInit();
    fixture.detectChanges()
    expect(tasksService.getTasks).toHaveBeenCalledWith('3');
    component.tasks$!.subscribe((tasks) => {
      expect(tasks.length).toBe(0);
    });
  });

  it('Should call tasksService.addTask and logger.info when addTaskHandler called', () => {
    component.todoId = '1';
    component.taskTitle = 'New task';
    component.addTaskHandler();

    expect(tasksService.addTask).toHaveBeenCalledWith('1', 'New task');
    expect(loggerService.info).toHaveBeenCalledWith('Add Task w/title:', 'TasksComponent', 'New task');
    expect(component.taskTitle).toBe('');
  });

  it('should call tasksService.deleteTask and logger.warn when deleteTask called', () => {
    component.todoId = '1';
    component.deleteTask('1');

    expect(tasksService.deleteTask).toHaveBeenCalledWith('1', '1');
    expect(loggerService.warn).toHaveBeenCalledWith('Remove task w/id:', 'TasksComponent', '1');
  });

  it('Should call tasksService.updateTask and logger.warn when changeTaskStatus called', () => {
    const newTask: UpdateTaskRequest = {
      title: 'Task 1',
      description: 'Task description',
      completed: false,
      status: TaskStatusEnum.completed,
      priority: 1,
      startDate: '2023-07-01',
      deadline: '2023-07-10',
    }
    component.todoId = '1';
    const event = { taskId: '1', newTask: newTask };
    component.changeTaskStatus(event);

    expect(tasksService.updateTask).toHaveBeenCalledWith('1', '1', newTask);
    expect(loggerService.warn).toHaveBeenCalledWith('Update task(id) status to:', 'TasksComponent', {
      id: '1',
      status: TaskStatusEnum.completed,
    });
  });
});
