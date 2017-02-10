import { Injectable } from '@angular/core';
import { Data } from 'cropperjs';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable()
export class DataService {
  private _formValue: any;
  private _cropData: Data;
  private _imageUrl: string;

  get formValue(): any {
    return this._formValue;
  }

  get cropData(): Data {
    return this._cropData;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  constructor() {

  }

}
