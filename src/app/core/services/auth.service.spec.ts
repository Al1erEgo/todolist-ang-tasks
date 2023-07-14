import {AuthService} from "./auth.service";
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest
} from "@angular/common/http/testing";
import {NotificationService} from "./notification.service";
import {LoggerService} from "../../shared/services/logger.service";
import {TestBed} from "@angular/core/testing";
import {Router} from "@angular/router";
import {CommonResponseType} from "../models/core.models";
import {ResultCodeEnum} from "../enums/resultCode.enum";
import {environment} from "../../../environments/environment.prod";
import {MeResponse} from "../models/auth.models";
import {HttpErrorResponse} from "@angular/common/http";
import {Observable} from "rxjs";

describe('AuthService', ()=>{
  let service: AuthService
  let httpMock: HttpTestingController;
  let notificationService: NotificationService;
  let loggerService: LoggerService;
  let routerService: Router;

  beforeEach(()=>{
    //чтобы зачистить вызовы - пересоздавать перед каждым тестом, ресет общий не работает(старая версия жасмин?)
    const fakeNotificationService = jasmine.createSpyObj('NotificationService',['handleError', 'handleSuccess', 'clear'])
    const fakeLoggerService = jasmine.createSpyObj('LoggerService', ['info', 'error', 'warn'])
    const fakeRouter = jasmine.createSpyObj('Router', ['navigate'])

    TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthService,
          {provide: NotificationService, useValue: fakeNotificationService},
          {provide: LoggerService, useValue: fakeLoggerService},
          {provide: Router, useValue: fakeRouter},
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

  it('Should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    const loginData = { email: 'testuser@mail.com', password: 'password', rememberMe: false };

    it('Should send login request and navigate to home page if login is successful', ()=>{
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

    it('Should send login request and show error notification if login is unsuccessful', () => {
      const response: CommonResponseType = {
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
  });

  describe('logout', () => {

    beforeEach(()=>{
      service.isAuth = true
    })

    it('Should send logout request and navigate to login page if logout is successful', () => {
      const response: CommonResponseType = {
        data: {},
        resultCode: ResultCodeEnum.success,
        messages: []
      };

      service.logout();
      const req: TestRequest = httpMock.expectOne(`${environment.baseUrl}/auth/login`);
      expect(req.request.method).toBe('DELETE');
      req.flush(response);

      expect(service.isAuth).toBeFalse();
      expect(routerService.navigate).toHaveBeenCalledWith(['/login']);
      expect(loggerService.info).toHaveBeenCalledWith('Logout request sent', 'AuthService');
      expect(loggerService.info).toHaveBeenCalledWith('Logout successful', 'AuthService');
    });

    it('Should send logout request and do not navigate if logout is unsuccessful', () => {
      const response: CommonResponseType = {
        data: {},
        resultCode: ResultCodeEnum.error,
        messages: ['Logout failed'],
      };

      service.logout();
      const req: TestRequest = httpMock.expectOne(`${environment.baseUrl}/auth/login`);
      expect(req.request.method).toBe('DELETE');
      req.flush(response);

      expect(service.isAuth).toBeTrue();
      expect(routerService.navigate).not.toHaveBeenCalled();
      expect(loggerService.info).toHaveBeenCalledWith('Logout request sent', 'AuthService');
      expect(loggerService.info).not.toHaveBeenCalledWith('Logout successful', 'AuthService');
    });
  });

  describe('me', () => {

    beforeEach(()=>{
      service.isAuth = false
    })

    it('Should send me request and set isAuth to true if the response is successful', (done) => {
      const response: CommonResponseType<MeResponse> = {
        resultCode: ResultCodeEnum.success,
        data: { id: 1, email: 'testuser@mail.com', login: 'testUser' },
        messages: []
      };

      service.me();
      const req: TestRequest = httpMock.expectOne(`${environment.baseUrl}/auth/me`);
      expect(req.request.method).toBe('GET');
      req.flush(response);

      expect(service.isAuth).toBeTrue();
      expect(loggerService.info).toHaveBeenCalledWith('me request sent', 'AuthService');
      expect(loggerService.info).toHaveBeenCalledWith('me request successful', 'AuthService');
      expect(loggerService.error).not.toHaveBeenCalled();
      service.authRequest.then(()=>{
        done()
      })
    });

    it('Should send me request and set isAuth to false if the response is unsuccessful', (done) => {
      const response: CommonResponseType = {
        data: {},
        resultCode: ResultCodeEnum.error,
        messages: ['Unauthorized'],
      };

      service.me();
      const req: TestRequest = httpMock.expectOne(`${environment.baseUrl}/auth/me`);
      expect(req.request.method).toBe('GET');
      req.flush(response);

      expect(service.isAuth).toBeFalse();
      expect(loggerService.info).toHaveBeenCalledWith('me request sent', 'AuthService');
      expect(loggerService.info).not.toHaveBeenCalledWith('me request successful', 'AuthService');
      service.authRequest.then(()=>{
        done()
      })
    });
  });

  describe('errorHandler', () => {
    it('Should handle HttpErrorResponse and return EMPTY observable', () => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });

      const result$: Observable<never> = service['errorHandler'](errorResponse);

      result$.subscribe({
        next: () => {
          fail('Next should not be called');
        },
        error: () => {
          fail('Error should not be called');
        },
        complete: () => {
          expect(notificationService.handleError).toHaveBeenCalledWith('Http failure response for (unknown url): 500 Internal Server Error');
        },
      });
    });
  });

})


