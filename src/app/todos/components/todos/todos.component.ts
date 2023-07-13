import { Component, OnInit } from '@angular/core'
import { TodosService } from 'src/app/todos/services/todos.service'
import { Observable } from 'rxjs'
import { DomainTodo } from 'src/app/todos/models/todos.models'
import { AuthService } from 'src/app/core/services/auth.service'
import {LoggerService} from "../../../shared/services/logger.service";

@Component({
  selector: 'tl-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css'],
})
export class TodosComponent implements OnInit {
  todos$?: Observable<DomainTodo[]>
  todoTitle = ''
  constructor(private todosService: TodosService, private authService: AuthService, private logger: LoggerService) {
    this.logger.info('Todos component initialised', 'TodosComponent')
  }

  ngOnInit(): void {
    //subscribe
    this.todos$ = this.todosService.todos$
    this.todosService.getTodos()
  }

  addTodoHandler() {
    this.todosService.addTodo(this.todoTitle)
    this.todoTitle = ''
    this.logger.info('Add Todo w/title:', 'TodosComponent', this.todoTitle)
  }

  deleteTodo(todoId: string) {
    this.todosService.deleteTodo(todoId)
    this.logger.warn('Remove todo w/id:', 'TodosComponent', todoId)
  }

  editTodo(data: { todoId: string; title: string }) {
    this.todosService.updateTodoTitle(data.todoId, data.title)
    this.logger.warn('Update todo(id) title to:', 'TodosComponent', data)
  }

  logoutHandler() {
    this.authService.logout()
    this.logger.warn('Logout', 'TodosComponent')
  }
}
