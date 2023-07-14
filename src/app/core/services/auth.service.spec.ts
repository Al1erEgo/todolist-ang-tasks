import {AuthService} from "./auth.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {NotificationService} from "./notification.service";
import {LoggerService} from "../../shared/services/logger.service";
import {TestBed} from "@angular/core/testing";
import {Router} from "@angular/router";
import {CommonResponseType} from "../models/core.models";
import {ResultCodeEnum} from "../enums/resultCode.enum";
import {environment} from "../../../environments/environment.prod";

describe('AuthService', ()=>{
  let service: AuthService
  let httpMock: HttpTestingController;
  let notificationService: NotificationService;
  let loggerService: LoggerService;
  let routerService: Router;

  const fakeNotificationService = jasmine.createSpyObj('NotificationService',['handleError', 'handleSuccess', 'clear'])
  const fakeLoggerService = jasmine.createSpyObj('LoggerService', ['info', 'error', 'warn'])

  class FakeRouter {
    navigate = jasmine.createSpy('navigate');
  }

  beforeEach(()=>{
    TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthService,
          {provide: NotificationService, useValue: fakeNotificationService},
          {provide: LoggerService, useValue: fakeLoggerService},
          {provide: Router, useClass: FakeRouter},
        ]
    })
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(NotificationService);
    loggerService = TestBed.inject(LoggerService);
    routerService = TestBed.inject(Router);
  })

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', ()=>{
    const loginData = { email: 'testuser@mail.com', password: 'password', rememberMe: false };

    it('should send login request and navigate to home page if login is successful', ()=>{
      const response: CommonResponseType<{ userId: number }> = {
        resultCode: ResultCodeEnum.success,
        data: { userId: 1 },
        messages: []
      };
      service.login(loginData);
      const req = httpMock.expectOne(`${environment.baseUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(response);

      expect(service.isAuth).toBeTrue();
      expect(routerService.navigate).toHaveBeenCalledWith(['/']);
      expect(notificationService.handleError).not.toHaveBeenCalled();
      expect(loggerService.info).toHaveBeenCalledWith('Login request sent', 'AuthService');
      expect(loggerService.info).toHaveBeenCalledWith('Login successful', 'AuthService');
      expect(loggerService.error).not.toHaveBeenCalled();
    })

    it('should send login request and show error notification if login is unsuccessful', () => {
      const response: CommonResponseType<any> = {
        resultCode: ResultCodeEnum.error,
        data: {},
        messages: ["Incorrect Email or Password"],
      };

      service.login(loginData);
      const req = httpMock.expectOne(`${environment.baseUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(response);


      expect(service.isAuth).toBeFalse();
      expect(routerService.navigate).not.toHaveBeenCalled();
      expect(notificationService.handleError).toHaveBeenCalledWith("Incorrect Email or Password");
      expect(loggerService.info).toHaveBeenCalledWith('Login request sent', 'AuthService');
      expect(loggerService.info).not.toHaveBeenCalledWith('Login successful', 'AuthService');
      expect(loggerService.error).toHaveBeenCalledWith('Login request error:', 'AuthService', response);
    });
  })
})


