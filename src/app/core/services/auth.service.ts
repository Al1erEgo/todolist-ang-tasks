import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { environment } from 'src/environments/environment'
import { CommonResponseType } from 'src/app/core/models/core.models'
import { ResultCodeEnum } from 'src/app/core/enums/resultCode.enum'
import { Router } from '@angular/router'
import { LoginRequestData, MeResponse } from 'src/app/core/models/auth.models'
import { EMPTY } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { NotificationService } from 'src/app/core/services/notification.service'
import {LoggerService} from "../../shared/services/logger.service";

@Injectable()
export class AuthService {
  isAuth = false

  resolveAuthRequest: Function = () => {}

  authRequest = new Promise(resolve => {
    this.resolveAuthRequest = resolve
  })

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService,
    private logger: LoggerService
  ) {
    this.logger.info('AuthService initialized', 'AuthService');
  }

  login(data: LoginRequestData) {
    this.logger.info('Login request sent', 'AuthService');
    this.http
      .post<CommonResponseType<{ userId: number }>>(`${environment.baseUrl}/auth/login`, data)
      .pipe(catchError(this.errorHandler.bind(this)))
      .subscribe(res => {
        if (res.resultCode === ResultCodeEnum.success) {
          this.isAuth = true
          this.logger.info('Login successful', 'AuthService');
          this.router.navigate(['/'])
        } else {
          this.notificationService.handleError(res.messages[0])
          this.logger.error('Login request error:', 'AuthService', res);
        }
      })
  }
  logout() {
    this.logger.info('Logout request sent', 'AuthService');
    this.http
      .delete<CommonResponseType>(`${environment.baseUrl}/auth/login`)
      .pipe(catchError(this.errorHandler.bind(this)))
      .subscribe(res => {
        if (res.resultCode === ResultCodeEnum.success) {
          this.logger.info('Logout successful', 'AuthService');
          this.isAuth = false
          this.router.navigate(['/login'])
        }
      })
  }

  me() {
    this.logger.info('me request sent', 'AuthService');
    this.http
      .get<CommonResponseType<MeResponse>>(`${environment.baseUrl}/auth/me`)
      .pipe(catchError(this.errorHandler.bind(this)))
      .subscribe(res => {
        if (res.resultCode === ResultCodeEnum.success) {
          this.isAuth = true
          this.logger.info('me request successful', 'AuthService');
        }
        this.resolveAuthRequest()
      })
  }
  private errorHandler(err: HttpErrorResponse) {
    this.logger.error('Error occurred', 'AuthService');
    this.notificationService.handleError(err.message)
    return EMPTY
  }
}
