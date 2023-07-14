import {NotificationService} from "./notification.service";
import {LoggerService} from "../../shared/services/logger.service";
import {TestBed} from "@angular/core/testing";


describe('NotificationService', ()=>{
  let service: NotificationService
  let loggerService: LoggerService

  const fakeLoggerService = jasmine.createSpyObj('LoggerService', ['info', 'error', 'warn'])
  beforeEach(()=>{
    TestBed.configureTestingModule({
      providers: [NotificationService, {provide: LoggerService, useValue: fakeLoggerService}],
  })
    service = TestBed.inject(NotificationService)
    loggerService = TestBed.inject(LoggerService)
  })

  it('Should be created', ()=>{
    expect(service).toBeTruthy()
  })

  it('On initialise notify$ should be null', ()=>{
    expect(service.notify$.value).toBeNull()
  })

  it('Should add error notification and log when calling handleError', () => {
    const errorMessage = 'Error message';
    service.handleError(errorMessage);
    expect(service.notify$.value).toEqual({ severity: 'error', message: errorMessage });
    expect(loggerService.error).toHaveBeenCalledWith('Error message added', 'NotificationService');
  });

  it('Should add success notification and log when calling handleSuccess', () => {
    const successMessage = 'Success message';
    service.handleSuccess(successMessage);
    expect(service.notify$.value).toEqual({ severity: 'success', message: successMessage });
    expect(loggerService.info).toHaveBeenCalledWith('Success message added', 'NotificationService');
  });

  it('Should clear notification and log when calling clear', () => {
    service.clear();
    expect(service.notify$.value).toBeNull();
    expect(loggerService.warn).toHaveBeenCalledWith('Notification cleared', 'NotificationService');
  });

})
