import { Component, OnInit } from '@angular/core'
import { NotificationService } from 'src/app/core/services/notification.service'
import { Observable } from 'rxjs'
import { Notify } from 'src/app/core/models/notify.models'
import {LoggerService} from "../../services/logger.service";

@Component({
  selector: 'tl-notify',
  templateUrl: './notify.component.html',
  styleUrls: ['./notify.component.css'],
})
export class NotifyComponent implements OnInit {
  notify$?: Observable<Notify | null>

  constructor(private notificationService: NotificationService, private logger: LoggerService) {
    this.logger.info('Notification component initialised', 'NotificationComponent')
  }

  ngOnInit(): void {
    //subscribe
    this.notify$ = this.notificationService.notify$
    this.logger.info('Notification component subscribed on notification messages', 'NotificationComponent')
  }

  closeNotification() {
    this.logger.info('Notification close', 'NotificationComponent')
    this.notificationService.clear()
  }
}
