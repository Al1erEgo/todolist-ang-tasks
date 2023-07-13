import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject } from 'rxjs'
import {
  DomainTask,
  GetTasksResponse,
  Task,
  UpdateTaskRequest,
} from 'src/app/todos/models/tasks.models'
import { environment } from 'src/environments/environment'
import {map, tap} from 'rxjs/operators'
import { CommonResponseType } from 'src/app/core/models/core.models'
import {LoggerService} from "../../shared/services/logger.service";

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  tasks$ = new BehaviorSubject<DomainTask>({})
  constructor(private http: HttpClient, private logger: LoggerService) {
    this.logger.info('TasksService initialised', 'TasksService')
  }
  getTasks(todoId: string) {
    this.logger.info('Tasks data requested for todo(id):', 'TasksService', todoId);
    this.http
      .get<GetTasksResponse>(`${environment.baseUrl}/todo-lists/${todoId}/tasks`)
      .pipe(
        map(res => res.items),
        tap(res => {
        this.logger.info('Tasks data received:', 'TasksService', res);
      }))
      .subscribe((res: Task[]) => {
        const stateTasks = this.tasks$.getValue()
        stateTasks[todoId] = res
        this.tasks$.next(stateTasks)
        this.logger.info('Tasks data updated in tasks$ subject:', 'TasksService', res);
      },
        error => {
          this.logger.error('Error occurred while fetching tasks:', 'TasksService', error);
        })
  }
  addTask(todoId: string, title: string) {
    this.logger.info('Add task request initialised', 'TasksService');
    this.http
      .post<CommonResponseType<{ item: Task }>>(
        `${environment.baseUrl}/todo-lists/${todoId}/tasks`,
        { title }
      )
      .pipe(
        map(res => {
          const stateTasks = this.tasks$.getValue()
          const newTask = res.data.item
          const newTasks = [newTask, ...stateTasks[todoId]]
          stateTasks[todoId] = newTasks
          return stateTasks
        }),
        tap(() => {
          this.logger.info('Task added', 'TasksService', title);
        })
      )
      .subscribe(res => {
        this.tasks$.next(res)
        this.logger.info('Tasks data updated in tasks$ subject:', 'TasksService', res);
      },
        error => {
          this.logger.error('Error occurred while adding task:', 'TasksService', error);
        })
  }
  deleteTask(todoId: string, taskId: string) {
    this.logger.info('Delete task request initialised, taskId:', 'TasksService', taskId);
    this.http
      .delete<CommonResponseType>(`${environment.baseUrl}/todo-lists/${todoId}/tasks/${taskId}`)
      .pipe(
        map(() => {
          const stateTasks = this.tasks$.getValue()
          const taskForTodo = stateTasks[todoId]
          stateTasks[todoId] = taskForTodo.filter(({ id }) => id !== taskId)
          return stateTasks
        }),
        tap(() => {
          this.logger.info('Task deleted', 'TasksService');
        })
      )
      .subscribe(res => {
        this.tasks$.next(res)
        this.logger.info('Tasks data updated in tasks$ subject:', 'TasksService', res);
      }, error => {
        this.logger.error('Error occurred while deleting task:', 'TasksService', error);
      })
  }

  updateTask(todoId: string, taskId: string, newTask: UpdateTaskRequest) {
    this.logger.info('Update task request initialised', 'TasksService', newTask);
    this.http
      .put<CommonResponseType<{ item: Task }>>(
        `${environment.baseUrl}/todo-lists/${todoId}/tasks/${taskId}`,
        newTask
      )
      .pipe(
        map(() => {
          const stateTasks = this.tasks$.getValue()
          const tasksForTodo = stateTasks[todoId]
          const newTasks = tasksForTodo.map((el: Task) =>
            el.id === taskId ? { ...el, ...newTask } : el
          )
          stateTasks[todoId] = newTasks
          return stateTasks
        }),
        tap(() => {
          this.logger.info('Task updated', 'TasksService');
        })
      )
      .subscribe(res => {
        this.tasks$.next(res)
        this.logger.info('Tasks data updated in tasks$ subject:', 'TasksService', res);
      },
    error => {
      this.logger.error('Error occurred while updating task:', 'TasksService', error);
    })
  }
}
