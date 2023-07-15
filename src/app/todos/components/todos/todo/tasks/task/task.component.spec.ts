import {TaskComponent} from "./task.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {LoggerService} from "../../../../../../shared/services/logger.service";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {TaskStatusEnum} from "../../../../../../core/enums/taskStatus.enum";
import {UpdateTaskRequest} from "../../../../../models/tasks.models";

describe('TaskComponent', ()=> {
  let component: TaskComponent
  let fixture: ComponentFixture<TaskComponent>;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const fakeLoggerService = jasmine.createSpyObj('LoggerService', ['info', 'error', 'warn'])

    await TestBed.configureTestingModule({
      declarations: [TaskComponent],
      providers: [
        { provide: LoggerService, useValue: fakeLoggerService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    loggerService = TestBed.inject(LoggerService);

    component.task = {
      id: '1',
      todoListId: '1',
      order: 1,
      addedDate: '2023-07-01',
      title: 'Task 1',
      description: 'Description 1',
      completed: false,
      status: 0,
      priority: 1,
      startDate: '2023-07-01',
      deadline: '2023-07-07',
    }
    fixture.detectChanges();
  });

  it('Should be created and call logger.info', () => {
    expect(component).toBeTruthy();
    expect(loggerService.info).toHaveBeenCalled()
  });

  it('Should emit deleteTaskEvent when deleteTaskHandler called', () => {
    const deleteTaskEventSpy = spyOn(component.deleteTaskEvent, 'emit');
    component.deleteTaskHandler();
    expect(deleteTaskEventSpy).toHaveBeenCalledWith('1');
  });

  it('Should emit changeTaskEvent with new status completed when changeTaskStatusHandler called', () => {
    const changeTaskEventSpy = spyOn(component.changeTaskEvent, 'emit');

    const event = {
      currentTarget: { checked: true },
    } as unknown as MouseEvent;

    component.changeTaskStatusHandler(event);
    expect(changeTaskEventSpy).toHaveBeenCalledWith({
      taskId: component.task.id,
      newTask: {
        title: component.task.title,
        description: component.task.description,
        completed: component.task.completed,
        priority: component.task.priority,
        startDate: component.task.startDate,
        deadline: component.task.deadline,
        status: TaskStatusEnum.completed,
      },
    });
  });

  it('Should emit changeTaskEvent with new status uncompleted when changeTaskStatusHandler called', () => {
    const changeTaskEventSpy = spyOn(component.changeTaskEvent, 'emit');

    const event = {
      currentTarget: { checked: false },
    } as unknown as MouseEvent;

    component.changeTaskStatusHandler(event);
    expect(changeTaskEventSpy).toHaveBeenCalledWith({
      taskId: component.task.id,
      newTask: {
        title: component.task.title,
        description: component.task.description,
        completed: component.task.completed,
        priority: component.task.priority,
        startDate: component.task.startDate,
        deadline: component.task.deadline,
        status: TaskStatusEnum.active,
      },
    });
  });

  it('Should activate editMode and set newTitle when activateEditModeHandler called and call logger.info', () => {
    component.activateEditModeHandler();

    expect(component.editMode).toBe(true);
    expect(component.newTitle).toBe('Task 1');
  });

  it('Should emit changeTaskEvent with new title when changeTitleHandler called', () => {
    const changeTaskEventSpy = spyOn(component.changeTaskEvent, 'emit');

    component.newTitle = 'Updated Task';
    component.changeTitleHandler();

    expect(changeTaskEventSpy).toHaveBeenCalledWith({
      taskId: '1',
      newTask: {
        title: 'Updated Task',
        description: component.task.description,
        completed: component.task.completed,
        priority: component.task.priority,
        startDate: component.task.startDate,
        deadline: component.task.deadline,
        status: component.task.status,
      },
    });
    expect(component.editMode).toBe(false);
    expect(component.newTitle).toBe('');
    expect(loggerService.info).toHaveBeenCalled()
  });

  it('should emit changeTaskEvent with updated task when changeTask called', () => {
    const changeTaskEventSpy = spyOn(component.changeTaskEvent, 'emit');

    const patch = { status: TaskStatusEnum.completed } as Partial<UpdateTaskRequest>;
    component.changeTask(patch);

    expect(changeTaskEventSpy).toHaveBeenCalledWith({
      taskId: '1',
      newTask: {
        title: component.task.title,
        description: component.task.description,
        completed: component.task.completed,
        priority: component.task.priority,
        startDate: component.task.startDate,
        deadline: component.task.deadline,
        status: TaskStatusEnum.completed,
      },
    });
  });

})

