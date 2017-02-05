import { Component } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, FormControl } from '@angular/forms';
import * as googlePhoneLib from 'google-libphonenumber';
import { Http, Headers, RequestOptions } from '@angular/http';

let phoneUtil = googlePhoneLib.PhoneNumberUtil.getInstance();

function phoneValidator(control: AbstractControl): { [key: string]: boolean } {
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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  imgUrl: SafeStyle;
  private img: File;

  form: FormGroup;
  contacts: FormArray;
  physicians: FormArray;
  conditions: FormArray;
  medications: FormArray;
  allergies: FormArray;

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer, private http: Http) {

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

  submit() {
    let formData = new FormData();
    formData.append('image', this.img, this.img.name);
    formData.append('data', JSON.stringify(this.form.value));
    let headers = new Headers();
    headers.append('Content-Tpe', 'multipart/form-data');
    headers.append('Accept', 'application/json');
    let options = new RequestOptions({ headers: headers });
    this.http.post('api/card', formData, options).subscribe();
  }
}
