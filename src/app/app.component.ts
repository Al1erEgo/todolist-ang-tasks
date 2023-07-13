import { Component, OnInit } from '@angular/core'
import { AuthService } from 'src/app/core/services/auth.service'
import {LoggerService} from "./shared/services/logger.service";

@Component({
  selector: 'tl-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private logger: LoggerService) {
    this.logger.info('App initialised', 'AppComponent')
  }
  ngOnInit() {
    this.authService.me()
  }
}
