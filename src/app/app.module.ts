import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { RouterModule, UrlHandlingStrategy } from '@angular/router';

import { appRoutes } from './app.routes';

import { DataService } from './data.service';

import { AppComponent } from './app.component';
import { PhotoUploadComponent } from './photo-upload/photo-upload.component';
import { FormComponent } from './form/form.component';
import { SuccessComponent } from './success/success.component';
import { CardComponent } from './card/card.component';
import { PreviewComponent } from './preview/preview.component';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { PrintComponent } from './print/print.component';

@NgModule({
  declarations: [
    AppComponent,
    PhotoUploadComponent,
    FormComponent,
    SuccessComponent,
    CardComponent,
    PreviewComponent,
    MessageDialogComponent,
    PrintComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    RouterModule.forRoot(appRoutes, { useHash: true })
  ],
  providers: [DataService],
  bootstrap: [AppComponent],
  entryComponents: [
    MessageDialogComponent
  ]
})
export class AppModule { }
