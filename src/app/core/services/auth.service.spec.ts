import {AuthService} from "./auth.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {NotificationService} from "./notification.service";
import {LoggerService} from "../../shared/services/logger.service";
import {TestBed} from "@angular/core/testing";
import {Router} from "@angular/router";

describe('AuthService', ()=>{
  let service: AuthService
  let httpMock: HttpTestingController;
  let notificationService: NotificationService;
  let loggerService: LoggerService;
  let routerService: Router;

  const fakeNotificationService = jasmine.createSpyObj('NotificationService',['handleError', 'handleSuccess', 'clear'])
  const fakeLoggerService = jasmine.createSpyObj('LoggerService', ['info', 'error', 'warn'])
  const fakeRouter = jasmine.createSpyObj('Router', ['navigate'])

  beforeEach(()=>{
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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
})


