import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './app.component'

import { AppRoutingModule } from 'src/app/app-routing.module'
import { TodosModule } from 'src/app/todos/todos.module'
import { AuthModule } from 'src/app/auth/auth.module'
import { CoreModule } from 'src/app/core/core.module'
import { HttpClientModule } from '@angular/common/http'

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, TodosModule, AuthModule, CoreModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
