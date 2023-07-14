import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotifyComponent } from './notify.component';
import { NotificationService } from 'src/app/core/services/notification.service';
import {of} from 'rxjs';
import { Notify } from 'src/app/core/models/notify.models';
import { LoggerService } from '../../services/logger.service';

describe('NotifyComponent', () => {
  let component: NotifyComponent;
  let fixture: ComponentFixture<NotifyComponent>;
  let notificationService: NotificationService
  let loggerService: LoggerService

  beforeEach(() => {
    let fakeNotificationService = jasmine.createSpyObj('NotificationService', ['clear']);
    const fakeLoggerService = jasmine.createSpyObj('LoggerService', ['info']);
    fakeNotificationService.notify$ = of(null);

    TestBed.configureTestingModule({
      declarations: [NotifyComponent],
      providers: [
        { provide: NotificationService, useValue: fakeNotificationService },
        { provide: LoggerService, useValue: fakeLoggerService },
      ],
    }).compileComponents();


    fixture = TestBed.createComponent(NotifyComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService)
    loggerService = TestBed.inject(LoggerService)
    fixture.detectChanges();
  });

  it('Should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('Should subscribe to notification messages', () => {
    expect(component.notify$).toBeDefined();
  });

  it('Should clear notification on closeNotification', () => {
    component.closeNotification();

    expect(notificationService.clear).toHaveBeenCalled();
    expect(loggerService.info).toHaveBeenCalledWith('Notification close', 'NotificationComponent');
  });

  it('Should show notification message', () => {
    component.notify$ = of({message: 'Alarm', severity: 'error'} as Notify);
    fixture.detectChanges();
    const notifyElement = fixture.nativeElement.querySelector('div.notification-item')

    expect(notifyElement.textContent).toContain('Alarm');
  });

  it('Close button should trigger closeNotification()', () => {
    spyOn(component, 'closeNotification')
    component.notify$ = of({message: 'Alarm', severity: 'error'} as Notify);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button')
    button.dispatchEvent(new Event('click'));
    expect(component.closeNotification).toHaveBeenCalled()
  });
});
