import { Routes } from '@angular/router';
import { FormComponent } from './form/form.component';
import { PreviewComponent } from './preview/preview.component';
import { SuccessComponent } from './success/success.component';


export const appRoutes: Routes = [
  {
    path: '',
    component: FormComponent
  }, {
    path: 'success',
    component: SuccessComponent
  }, {
    path: 'preview',
    component: PreviewComponent
  }
];

