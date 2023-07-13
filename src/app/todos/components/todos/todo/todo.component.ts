import { Component, EventEmitter, Input, Output } from '@angular/core'
import { DomainTodo, FilterType } from 'src/app/todos/models/todos.models'
import { TodosService } from 'src/app/todos/services/todos.service'
import {LoggerService} from "../../../../shared/services/logger.service";

@Component({
  selector: 'tl-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
})
export class TodoComponent {
  @Input() todo!: DomainTodo
  @Output() deleteTodoEvent = new EventEmitter<string>()
  @Output() editTodoEvent = new EventEmitter<{ todoId: string; title: string }>()
  isEditMode = false
  newTitle = ''
  constructor(private todosService: TodosService, private logger: LoggerService) {
    this.logger.info('Todo component initialised', 'TodoComponent')
  }

  deleteTodoHandler() {
    this.deleteTodoEvent.emit(this.todo.id)
  }
  activateEditModeHandler() {
    this.newTitle = this.todo.title
    this.isEditMode = true
    this.logger.info('Edit mode activated', 'TodoComponent')
  }
  editTitleHandler() {
    this.isEditMode = false
    this.editTodoEvent.emit({ todoId: this.todo.id, title: this.newTitle })
    this.logger.info('Edit mode deactivated', 'TodoComponent')
  }

  changeFilter(filter: FilterType) {
    this.todosService.changeFilter(this.todo.id, filter)
    this.logger.info('Filter changed, current filter: ', 'TodoComponent', filter)
  }
}
