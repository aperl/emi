import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, FormControl } from '@angular/forms';
import * as googlePhoneLib from 'google-libphonenumber';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import * as Cropper from 'cropperjs';

import { PhotoUploadComponent } from '../photo-upload/photo-upload.component';

let phoneUtil = googlePhoneLib.PhoneNumberUtil.getInstance();

function phoneValidator(control: AbstractControl): { [key: string]: boolean } {
  if (!control.value) {
    return null;
  }
  try {
    let number = phoneUtil.parse(control.value as string, 'US');
    if (!phoneUtil.isValidNumber(number)) {
      return { phone: true };
    }
  } catch (error) {
    return { phone: true };
  }
  return null;
}

function dateValidator(control: AbstractControl): { [key: string]: boolean } {
  if (isNaN(Date.parse(control.value))) {
    return { date: true };
  }
  console.log(new Date(control.value).toLocaleDateString());
  return null;
}

function emailValidator(control: AbstractControl): { [key: string]: boolean } {
  let input = document.createElement('input');
  input.type = 'email';
  input.value = control.value;
  if (!input.checkValidity()) {
    return { email: true };
  }
  return null;
}
@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent {

  @ViewChild(PhotoUploadComponent) photoUploadComponent: PhotoUploadComponent;

  pending = false;
  submitted = false;

  form: FormGroup;
  contacts: FormArray;
  physicians: FormArray;
  conditions: FormArray;
  medications: FormArray;
  allergies: FormArray;

  a: FormControl;

  constructor(
    private fb: FormBuilder,
    private http: Http,
    private router: Router,
    private element: ElementRef) {

    this.contacts = fb.array([this.makeContactGroup()]);
    this.physicians = fb.array([this.makePhysicianGroup()]);
    this.conditions = fb.array([]);
    this.medications = fb.array([]);
    this.allergies = fb.array([]);

    this.form = fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      dateOfBirth: ['', [Validators.required, dateValidator]],
      phoneNumber: ['', phoneValidator],
      email: ['', emailValidator],
      bloodType: ['', Validators.required],
      address: this.makeAddressGroup(),
      emergencyContacts: this.contacts,
      physicians: this.physicians,
      medicalConditions: this.conditions,
      medications: this.medications,
      allergies: this.allergies,
      otherInfo: ['']
    });

    let cardJson = localStorage.getItem('card');

    if (cardJson) {
      this.form.setValue(JSON.parse(cardJson));
    }

    this.form.valueChanges.subscribe((value) => {
      localStorage.setItem('card', JSON.stringify(value));
    });
  }

  formatDate() {
    let ctrl = this.form.get('dateOfBirth');
    if (ctrl.valid) {
      ctrl.setValue(new Date(ctrl.value).toLocaleDateString());
    }
  }

  formatPhone(event) {
    event.toString();
  }

  makeAddressGroup() {
    return this.fb.group({
      street: ['', Validators.required],
      street2: [''],
      city: ['Orem', Validators.required],
      state: ['Utah'],
      zip: ['84097', [Validators.required, Validators.pattern(/\d{5}(-\d{4})?/)]]
    });
  }

  makeContactGroup() {
    return this.fb.group({
      name: ['', Validators.required],
      relationship: ['', Validators.required],
      phoneNumber: ['', [Validators.required, phoneValidator] ],
      type: ['home', Validators.required]
    });
  }

  makePhysicianGroup() {
    return this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', [Validators.required, phoneValidator] ]
    });
  }

  makeConditionGroup() {
    return this.fb.control('', Validators.required);
  }

  makeMedicationGroup() {
    return this.fb.group({
      medication: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required]
    });
  }

  makeAllergyGroup() {
    return this.fb.control('', Validators.required);
  }

  addContact() {
    this.contacts.push(this.makeContactGroup());
  }

  removeContact(index) {
    this.contacts.removeAt(index);
  }


  private getTop(element: HTMLElement) {
    let top = element.offsetTop;
    return element.offsetTop + (element.offsetParent ? this.getTop(element.offsetParent as HTMLElement) : 0);
  }

  cropChanged() {

  }

  submit() {
    if (this.form.invalid) {
      this.submitted = true;
      let el = this.element.nativeElement as HTMLElement;
      el = el.querySelector('form .ng-invalid') as HTMLElement;
      let input = el.querySelector('input');
      if (input) {
        el = input;
      }
      window.scrollTo(0, this.getTop(el) - 30);
      el.focus();
      return;
    }

    this.pending = true;
    this.photoUploadComponent.getImage().then((img) => {
      let formData = new FormData();
      let headers = new Headers();
      if (img) {
        formData.append('image', img, 'image.jpeg');
      }

      formData.append('data', JSON.stringify(this.form.value));
      headers.append('Accept', 'application/json');
      let options = new RequestOptions({ headers: headers });
      this.http.post('api/card', formData, options).subscribe((result) => {
        let response = result.json();
        if (!response.error) {
          localStorage.removeItem('card');
          this.router.navigate(['success']);
        }
      }, (error) => { }

      , () => {
        this.pending = false;
      });
    });
  }

}
