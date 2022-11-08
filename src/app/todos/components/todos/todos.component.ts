import { Component, OnInit } from '@angular/core'
import { TodosService } from 'src/app/todos/services/todos.service'
import { Observable } from 'rxjs'
import { Todo } from 'src/app/todos/models/todos.models'

@Component({
  selector: 'tl-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css'],
})
export class TodosComponent implements OnInit {
  todos$?: Observable<Todo[]>
  constructor(private todosService: TodosService) {}

  ngOnInit(): void {
    //subscribe
    this.todos$ = this.todosService.todos$
    this.todosService.getTodos()
  }
}
