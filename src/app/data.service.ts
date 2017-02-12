import { Injectable } from '@angular/core';
import { Data } from 'cropperjs';
import { Observable, BehaviorSubject } from 'rxjs';
import { Http, Headers, RequestOptions } from '@angular/http';
import * as Cropper from 'cropperjs';
import { environment } from '../environments/environment';

let storage = environment.storage;

@Injectable()
export class DataService {
  private _formValue: any;
  private _cropData: Data;
  private _croppedImage: Blob;
  private _image: Blob;
  private _count: number;

  private _valid = false;

  constructor(private http: Http) {
    if (storage) {
      try {
        let data = storage.getItem('count');
        if (data) {
          this._count = JSON.parse(data);
        }
      } catch (error) {}
      try {
        let data = storage.getItem('valid');
        if (data) {
          this._valid = JSON.parse(data);
        }
      } catch (error) {}
      try {
        let data = storage.getItem('form');
        if (data) {
          this._formValue = JSON.parse(data);
        }
      } catch (error) {}

      try {
        let data = storage.getItem('crop');
        if (data) {
          this._cropData = JSON.parse(data);
        }
      } catch (error) {}
      // TODO: deserialize Image;
    }
  }

  get count(): number {
    return this._count;
  }

  set count(value) {
    this._count = value;
    if (storage) {
      storage.setItem('count', JSON.stringify(value));
    }
  }

  get valid(): boolean {
    return this._valid;
  }

  set valid(value) {
    this._valid = value;
    if (storage) {
      storage.setItem('valid', JSON.stringify(value));
    }
  }

  get formValue(): any {
    return this._formValue;
  }

  set formValue(value: any) {
    this._formValue = value;
    if (storage) {
      storage.setItem('form', JSON.stringify(value));
    }
  }

  get cropData(): Data {
    return this._cropData;
  }

  set cropData(value: Data) {
    this._cropData = value;
    if (storage) {
      storage.setItem('cropData', JSON.stringify(value));
    }
  }

  get image(): Blob {
    return this._image;
  }

  set image(value: Blob) {
    this._image = value;
    // TODO: Serialize image;
  }

  get croppedImage() {
    return this._croppedImage;
  }

  set croppedImage(value) {
    this._croppedImage = value;
  }

  getDataUrl(blob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = function(event) {
        resolve(event);
      };
      reader.onerror = function(error) {
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  }

  clearData() {
    storage.clear();
    this._cropData = null;
    this._formValue = null;
    this._croppedImage = null;
    this._image = null;
  }

  sendData(): Promise<any> {
    return new Promise((resolve, reject) => {
      let formData = new FormData();
      let headers = new Headers();
      if (this.croppedImage) {
        formData.append('image', this.croppedImage, 'image.jpeg');
      }

      this.formValue.count = this.count;

      formData.append('data', JSON.stringify(this.formValue));
      headers.append('Accept', 'application/json');
      let options = new RequestOptions({ headers: headers });
      this.http.post('api/card', formData, options).subscribe((result) => {
        let response = result.json();
        if (!response.error) {
          this.clearData();
          resolve();
        } else {
          reject(response.error);
        }
      }, reject);
    });
  }
}
