import { Component, EventEmitter, Input, Output } from '@angular/core'
import { Task, UpdateTaskRequest } from 'src/app/todos/models/tasks.models'
import { TaskStatusEnum } from 'src/app/core/enums/taskStatus.enum'
import {LoggerService} from "../../../../../../shared/services/logger.service";

@Component({
  selector: 'tl-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class TaskComponent {
  @Input() task!: Task
  @Output() deleteTaskEvent = new EventEmitter<string>()
  @Output() changeTaskEvent = new EventEmitter<{ taskId: string; newTask: UpdateTaskRequest }>()
  taskStatusEnum = TaskStatusEnum
  editMode = false
  newTitle = ''

  constructor(private logger: LoggerService) {
    this.logger.info('Task component initialised', 'TaskComponent')
  }

  deleteTaskHandler() {
    this.deleteTaskEvent.emit(this.task.id)
  }

  changeTaskStatusHandler(event: MouseEvent) {
    const newStatus = (event.currentTarget as HTMLInputElement).checked

    this.changeTask({
      status: newStatus ? this.taskStatusEnum.completed : this.taskStatusEnum.active,
    })
  }

  activateEditModeHandler() {
    this.newTitle = this.task.title
    this.editMode = true
    this.logger.info('Edit mode deactivated', 'TaskComponent')
  }

  changeTitleHandler() {
    this.editMode = false
    this.changeTask({ title: this.newTitle })
    this.newTitle = ''
    this.logger.info('Edit mode deactivated', 'TaskComponent')
  }

  changeTask(patch: Partial<UpdateTaskRequest>) {
    const newTask: UpdateTaskRequest = {
      status: this.task.status,
      description: this.task.description,
      completed: this.task.completed,
      deadline: this.task.deadline,
      priority: this.task.priority,
      startDate: this.task.startDate,
      title: this.task.title,
      ...patch,
    }
    this.changeTaskEvent.emit({ taskId: this.task.id, newTask })
  }
}
