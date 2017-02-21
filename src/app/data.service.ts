import { Injectable } from '@angular/core';
import { Data } from 'cropperjs';
import { Observable, BehaviorSubject } from 'rxjs';
import { Http, Headers, RequestOptions, URLSearchParams, QueryEncoder } from '@angular/http';
import * as Cropper from 'cropperjs';
import { environment } from '../environments/environment';
import 'rxjs/Rx';

let storage = environment.storage;

@Injectable()
export class DataService {
  private _formValue: ICard;
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
        } else {
          this._count = 1;
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

  get formValue(): ICard {
    return this._formValue;
  }

  set formValue(value: ICard) {
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

  getCards(filter?: any): Observable<ICard[]> {

    let params = new URLSearchParams();
    if (filter) {
      params.append('filter', JSON.stringify(filter));
    }

    return this.http.get('api/card', { search: params }).map(resp => {
      let cards = resp.json() as ICard[];
      cards.forEach((card) => {
        if (card.image) {
          card.imageUrl = '/images/' + card.image;
        }
        card.count = card.count || 1;
      });
      return cards;
    });
  }

  markAsPrinted(cards: ICard[]) {

    let req = cards.map(card => {
      return { id: card._id, data: { $set: { printed: true }}};
    });

    let formData = new FormData();
    formData.append('update', JSON.stringify(req));

    return this.http.put('api/card', formData).toPromise();
  }

  sendPrint(): Promise<any> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('api/print', JSON.stringify({
      firstName: this.formValue.firstName,
      lastName: this.formValue.lastName
    }), {
      headers: headers
    }).toPromise();
  }

  sendData(): Promise<any> {
    return new Promise((resolve, reject) => {
      let formData = new FormData();
      let headers = new Headers();
      if (this.croppedImage) {
        formData.append('image', this.croppedImage, 'image.jpeg');
      }

      let val = this.formValue;
      val.count = this.count;

      formData.append('data', JSON.stringify(val));
      headers.append('Accept', 'application/json');
      let options = new RequestOptions({ headers: headers });
      this.http.post('api/card', formData, options).subscribe((result) => {
        if (result.ok) {
          this.clearData();
          resolve();
        } else {
          reject(result.status);
        }
      }, reject);
    });
  }
}

export interface ICard {
  _id?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  bloodType: string;
  address: IAddress;
  emergencyContacts: IContact[];
  physicians: IPhysician[];
  medicalConditions: string[];
  medications: IMedication[];
  allergies: string[];
  otherInfo: string;
  count?: number;
  image?: string;
  imageUrl?: string;
}

export interface IAddress {
  street: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
}

export interface IContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface IPhysician {
  name: string;
  phoneNumber: string;
}

export interface IMedication {
  medication: string;
  dosage: string;
  frequency: string;
}
