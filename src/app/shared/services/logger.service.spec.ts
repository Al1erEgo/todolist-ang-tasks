import {LoggerService, LogLevel} from "./logger.service";
import {TestBed} from "@angular/core/testing";

describe('LoggerService', ()=>{
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggerService]
    })

    service = TestBed.inject(LoggerService)
    spyOn(console, 'error');
    spyOn(console, 'warn');
    spyOn(console, 'info');
  });

  const message = 'Message';
  const file = 'File name';
  const param = { key: 'value' };

  it('Should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should set logLevel to Info by default', () => {
    expect(service.logLevel).toEqual(LogLevel.Info);
  });

  it('Should call console.error with correct message and params when calling error', () => {
    service.error(message, file, param);
    expect(console.error).toHaveBeenCalledWith('%c ' + file + '--' + message, `color: red`, param);
  });

  it('Should call console.warn with correct message and params when calling warn', () => {
    service.warn(message, file, param);
    expect(console.warn).toHaveBeenCalledWith('%c ' + file + '--' + message, `color: orange`, param);
  });

  it('Should call console.info with correct message and params when calling info', () => {
    service.info(message, file, param);
    expect(console.info).toHaveBeenCalledWith('%c ' + file + '--' + message, `color: green`, param);
  });

  it('Should not call console.info when logLevel is set to Warn', () => {
    spyOn(service as any, 'logWith');
    service.logLevel = LogLevel.Warn;
    service.info(message, file, param);
    expect((service as any).logWith).toHaveBeenCalledWith(LogLevel.Info, message, file, param);
    expect(console.info).not.toHaveBeenCalled();
  });

})
