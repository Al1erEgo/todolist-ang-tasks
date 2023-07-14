import {LoginComponent} from "./login.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {AuthService} from "../../../core/services/auth.service";
import {LoggerService} from "../../../shared/services/logger.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

describe('LoginComponent', ()=>{
  let component: LoginComponent
  let fixture: ComponentFixture<LoginComponent>
  let authService: AuthService
  let loggerService: LoggerService

  beforeEach(async () =>{
    const fakeAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'me'])
    const fakeLoggerService = jasmine.createSpyObj('LoggerService', ['info', 'error', 'warn'])

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [LoginComponent],
      providers: [
        {provide: AuthService, useValue: fakeAuthService},
        {provide: LoggerService, useValue: fakeLoggerService},
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents()
  })

  beforeEach(()=>{
    fixture = TestBed.createComponent(LoginComponent)
    component = fixture.componentInstance
    authService = TestBed.inject(AuthService)
    loggerService = TestBed.inject(LoggerService)
    fixture.detectChanges()
  })

  it('Should be created and call logger.info', ()=>{
    expect(component).toBeTruthy()
    expect(loggerService.info).toHaveBeenCalledWith('Login component initialised', 'LoginComponent')
  })

  it('Should initialize the loginForm with empty values', () => {
    expect(component.loginForm.value).toEqual({
      email: '',
      password: '',
      rememberMe: false,
    });
  });

  it('Should set email and password as invalid and required when form is empty', () => {
    expect(component.email?.valid).toBeFalsy();
    expect(component.password?.valid).toBeFalsy();
    expect(component.email?.errors?.['required']).toBeTruthy();
    expect(component.password?.errors?.['required']).toBeTruthy();
  });

  it('Should set email pattern validation', () => {
    component.email?.setValue('test');
    expect(component.email?.hasError('pattern')).toBeTruthy();

    component.email?.setValue('test@example.com');
    expect(component.email?.hasError('pattern')).toBeFalsy();
  });

  it('should set password minimum length validation', () => {
    component.password?.setValue('12');
    expect(component.password?.hasError('minlength')).toBeTruthy();

    component.password?.setValue('123');
    expect(component.password?.hasError('minlength')).toBeFalsy();
  });

  it('Should call AuthService.login and LoggerService.info with valid form values on submit', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true,
    };
    component.loginForm.setValue(loginData);
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    expect(authService.login).toHaveBeenCalledWith(loginData);
    expect(loggerService.info).toHaveBeenCalledWith('Logging in with params:',
      'LoginComponent',
      loginData);
  });

  it('Should not call AuthService.login and LoggerService.info with invalid form values on submit', () => {
    const loginData = {
      email: 'test',
      password: '12',
      rememberMe: true,
    };
    component.loginForm.setValue(loginData);
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    expect(authService.login).not.toHaveBeenCalledWith(loginData);
    expect(loggerService.info).not.toHaveBeenCalledWith('Logging in with params:',
      'LoginComponent',
      loginData);
  });

  it('Should add inputError class for input on invalid email', () => {
    component.email?.setValue('test');

    const inputElement = fixture.nativeElement.querySelector('input[type="text"]');
    inputElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    expect(inputElement.classList.contains('inputError')).toBeTrue();
  });

  it('Should add inputError class for input on invalid password', () => {
    component.password?.setValue('12');

    const inputElement = fixture.nativeElement.querySelector('input[type="password"]');
    inputElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    expect(inputElement.classList.contains('inputError')).toBeTrue();
  });

  it('Should add inputSuccess class for input on valid email', () => {
    component.email?.setValue('test@mail.com');

    const inputElement = fixture.nativeElement.querySelector('input[type="text"]');
    inputElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    expect(inputElement.classList.contains('inputSuccess')).toBeTrue();
  });

  it('Should add inputSuccess class for input on valid password', () => {
    component.password?.setValue('123');

    const inputElement = fixture.nativeElement.querySelector('input[type="password"]');
    inputElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    expect(inputElement.classList.contains('inputSuccess')).toBeTrue();
  });
})
