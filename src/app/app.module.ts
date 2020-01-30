import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FlexLayoutModule } from '@angular/flex-layout';
import { AuthComponent } from './auth/auth.component';
import { MaterialModule } from './material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { FakeDbService } from './fake-db/fake-db.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorService } from './auth/auth-interceptor.service';
import { TestComponent } from './test/test.component';
import { NgxLoadingModule } from 'ngx-loading';
import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { PopUpWindowComponent } from './pop-up-window/pop-up-window.component';
import { NgxPrintModule } from 'ngx-print';
import { PrintPageComponent } from './print-page/print-page.component';
@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    TestComponent,
    ConfirmDialogComponent,
    PopUpWindowComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    InMemoryWebApiModule.forRoot(
      FakeDbService,
      { delay: 0, passThruUnknownUrl: true }
    ),
    NgxLoadingModule.forRoot({}),
    NgxPrintModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
  ],
  entryComponents:[ConfirmDialogComponent,PopUpWindowComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
