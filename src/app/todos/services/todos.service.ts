import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment'
import { BehaviorSubject } from 'rxjs'
import { DomainTodo, FilterType, Todo } from 'src/app/todos/models/todos.models'
import { CommonResponseType } from 'src/app/core/models/core.models'
import {map, tap} from 'rxjs/operators'
import {LoggerService} from "../../shared/services/logger.service";

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  todos$ = new BehaviorSubject<DomainTodo[]>([])

  constructor(private http: HttpClient, private logger: LoggerService) {
    this.logger.info('TodosService initialised', 'TodosService')
  }

  getTodos() {
    this.logger.info('Todos data requested', 'TodosService');
    this.http
      .get<Todo[]>(`${environment.baseUrl}/todo-lists`)
      .pipe(
        map(todos => {
          const newTodos: DomainTodo[] = todos.map(el => ({ ...el, filter: 'all' }))
          return newTodos
        }),
        tap(res => {
          this.logger.info('Todos data received:', 'TodosService', res);
        })
      )
      .subscribe(res => {
        this.todos$.next(res);
        this.logger.info('Todos data updated in todos$ subject:', 'TodosService', res);
      }, error => {
        this.logger.error('Error occurred while fetching todos:', 'TodosService', error);
      });
  }

  addTodo(title: string) {
    this.logger.info('Add todo request initialised', 'TodosService');
    this.http
      .post<
        CommonResponseType<{
          item: Todo
        }>
      >(`${environment.baseUrl}/todo-lists`, { title })
      .pipe(
        map(res => {
          const stateTodos = this.todos$.getValue()
          const newTodo: DomainTodo = { ...res.data.item, filter: 'all' }
          return [newTodo, ...stateTodos]
        }),
        tap(res => {
          this.logger.info('Todo added:', 'TodosService', res[0]);
        })
      )

      .subscribe((res: DomainTodo[]) => {
        this.todos$.next(res);
        this.logger.info('Todos data updated in todos$ subject:', 'TodosService', res);
      }, error => {
        this.logger.error('Error occurred while adding todo:', 'TodosService', error);
      });
  }

  deleteTodo(todoId: string) {
    this.logger.info('Delete todo request initialised, todoId:', 'TodosService', todoId);
    this.http
      .delete<CommonResponseType>(`${environment.baseUrl}/todo-lists/${todoId}`)
      .pipe(
        map(() => {
          const stateTodos = this.todos$.getValue();
          return stateTodos.filter(el => el.id !== todoId);
        }),
        tap(() => {
          this.logger.info('Todo deleted', 'TodosService', todoId);
        })
      )
      .subscribe(todos => {
        this.todos$.next(todos);
        this.logger.info('Todos data updated in todos$ subject:', 'TodosService', todos);
      }, error => {
        this.logger.error('Error occurred while deleting todo:', 'TodosService', error);
      });
  }

  updateTodoTitle(todoId: string, title: string) {
    this.logger.info('Update todo title request initialised', 'TodosService', {todoId, title});
    this.http
      .put<CommonResponseType>(`${environment.baseUrl}/todo-lists/${todoId}`, { title })
      .pipe(
        map(() => {
          const stateTodos = this.todos$.getValue();
          return stateTodos.map(todo => (todo.id === todoId ? { ...todo, title } : todo));
        }),
        tap(() => {
          this.logger.info('Todo title updated', 'TodosService');
        })
      )
      .subscribe(res => {
        this.todos$.next(res);
        this.logger.info('Todos data updated in todos$ subject:', 'TodosService', res);
      }, error => {
        this.logger.error('Error occurred while updating todo title:', 'TodosService', error);
      });
  }

  changeFilter(todoId: string, filter: FilterType) {
    const stateTodos = this.todos$.getValue()
    const newTodos: DomainTodo[] = stateTodos.map(el => (el.id === todoId ? { ...el, filter } : el))
    this.todos$.next(newTodos)
    this.logger.info('Filter changed:', 'TodosService', newTodos);
  }
}
