import { Component, OnInit, ElementRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, FormControl } from '@angular/forms';
import * as googlePhoneLib from 'google-libphonenumber';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';

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

  imgUrl: SafeStyle;
  pending = false;
  submitted = false;
  private img: File;

  form: FormGroup;
  contacts: FormArray;
  physicians: FormArray;
  conditions: FormArray;
  medications: FormArray;
  allergies: FormArray;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
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
      dateOfBirth: ['', Validators.required],
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

  attachPhoto(event: Event) {
    let el = event.currentTarget as HTMLInputElement;

    this.imgUrl = this.sanitizer.bypassSecurityTrustStyle('url(' + window.URL.createObjectURL(el.files.item(0)) + ')');
    this.img = el.files.item(0);
    // let reader = new FileReader();
    // reader.readAsDataURL(el.files.item(0));
    // reader.onload = () => {
    //   this.img = reader.url;
    // };
  }

  private getTop(element: HTMLElement) {
    let top = element.offsetTop;

    return element.offsetTop + (element.offsetParent ? this.getTop(element.offsetParent as HTMLElement) : 0);


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
    let formData = new FormData();
    let headers = new Headers();
    if (this.img) {
      formData.append('image', this.img, this.img.name);
      headers.append('Content-Type', 'multipart/form-data');
    }
    formData.append('data', JSON.stringify(this.form.value));
    headers.append('Accept', 'application/json');
    let options = new RequestOptions({ headers: headers });
    this.http.post('api/card', formData, options).subscribe((result) => {
      let response = result.json();
      if (!response.error) {
        this.router.navigate(['success']);
      }
    }, (error) => { }

    , () => {
      this.pending = false;
    });
  }

}
