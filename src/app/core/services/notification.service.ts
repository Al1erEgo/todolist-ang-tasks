import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { Notify } from 'src/app/core/models/notify.models'
import {LoggerService} from "../../shared/services/logger.service";

@Injectable()
export class NotificationService {
  notify$ = new BehaviorSubject<Notify | null>(null)

  constructor(private logger: LoggerService) {
    this.logger.info('NotificationService initialised', 'NotificationService')
  }

  handleError(message: string) {
    this.notify$.next({ severity: 'error', message })
    this.logger.error('Error message added', 'NotificationService')
  }

  handleSuccess(message: string) {
    this.notify$.next({ severity: 'success', message })
    this.logger.info('Success message added', 'NotificationService')
  }

  clear() {
    this.notify$.next(null)
    this.logger.warn('Notification cleared', 'NotificationService')
  }
}
