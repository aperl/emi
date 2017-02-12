import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, FormControl } from '@angular/forms';
import * as googlePhoneLib from 'google-libphonenumber';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
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
  if (!control.value) {
    return null;
  }
  if (isNaN(Date.parse(control.value))) {
    return { date: true };
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
export class FormComponent implements AfterViewInit {

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
    private router: Router,
    private data: DataService,
    private element: ElementRef) {

    let value = this.data.formValue;

    if (value) {
      try {
        this.contacts = fb.array(value.emergencyContacts.map(c => this.makeContactGroup(c)));
      } catch (e) {}
      try {
        this.physicians = fb.array(value.physicians.map((p) => this.makePhysicianGroup(p)));
      } catch (e) {}
      try {
        this.conditions = fb.array(value.medicalConditions.map((c) => this.makeConditionGroup(c)));
      } catch (e) {}
      try {
        this.medications = fb.array(value.medications.map((m) => this.makeMedicationGroup(m)));
      } catch (e) {}
      try {
        this.allergies = fb.array(value.allergies.map((a) => this.makeAllergyGroup(a)));
      } catch (e) {}
    } else {
      this.contacts = fb.array([this.makeContactGroup()]);
      this.physicians = fb.array([this.makePhysicianGroup()]);
      this.conditions = fb.array([]);
      this.medications = fb.array([]);
      this.allergies = fb.array([]);

      value = {};

    }

    this.form = fb.group({
      firstName: [value.firstName || '', Validators.required],
      middleName: [value.middleName || ''],
      lastName: [value.lastName || '', Validators.required],
      dateOfBirth: [value.dateOfBirth || '', [Validators.required, dateValidator]],
      phoneNumber: [value.phoneNumber || '', phoneValidator],
      email: [value.email || '', emailValidator],
      bloodType: [value.bloodType || '', Validators.required],
      address: value.address ? this.makeAddressGroup(value.address) : this.makeAddressGroup(),
      emergencyContacts: this.contacts,
      physicians: this.physicians,
      medicalConditions: this.conditions,
      medications: this.medications,
      allergies: this.allergies,
      otherInfo: [value.otherInfo || '']
    });

    this.form.valueChanges.subscribe((formValue) => {
      try {
        this.data.formValue = formValue;
        this.data.valid = this.form.valid;
      } catch (e) { }
    });
  }

  ngAfterViewInit() {
    if (this.data.image) {
      this.photoUploadComponent.setPhoto(this.data.image);
    }
    if (this.data.cropData) {
      this.photoUploadComponent.cropper.setData(this.data.cropData);
    }
  }

  formatDate() {
    let ctrl = this.form.get('dateOfBirth');
    if (ctrl.valid && ctrl.value) {
      let val = new Date(ctrl.value).toLocaleDateString()
      if (val !== ctrl.value) {
        ctrl.setValue(val);
      }
    }
  }

  formatPhone(event) {
    event.toString();
  }

  makeAddressGroup(address = {street: '', street2: '', city: 'Orem', state: 'UT', zip: '84097'}) {
    return this.fb.group({
      street: [address.street, Validators.required],
      street2: [address.street2],
      city: [address.city, Validators.required],
      state: [address.state],
      zip: [address.zip, [Validators.required, Validators.pattern(/\d{5}(-\d{4})?/)]]
    });
  }

  makeContactGroup(contact = { name: '', relationship: '', phoneNumber: ''}) {
    return this.fb.group({
      name: [contact.name, Validators.required],
      relationship: [contact.relationship, Validators.required],
      phoneNumber: [contact.phoneNumber, [Validators.required, phoneValidator] ],
    });
  }

  makePhysicianGroup(physician = {name: '', phoneNumber: ''}) {
    return this.fb.group({
      name: [physician.name, Validators.required],
      phoneNumber: [physician.phoneNumber, [Validators.required, phoneValidator] ]
    });
  }

  makeConditionGroup(condition = '') {
    return this.fb.control(condition, Validators.required);
  }

  makeMedicationGroup(medication = {medication: '', dosage: '', frequency: ''}) {
    return this.fb.group({
      medication: [medication.medication, Validators.required],
      dosage: [medication.dosage, Validators.required],
      frequency: [medication.frequency, Validators.required]
    });
  }

  makeAllergyGroup(allergy = '') {
    return this.fb.control(allergy, Validators.required);
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

  cropChanged(data: Cropper.Data) {
    this.data.cropData = data;
  }

  imageChanged(image: Blob) {
    this.data.image = image;
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
    this.data.valid = true;

    this.photoUploadComponent.getImage().then((img) => {
      this.data.croppedImage = img;
      this.router.navigate(['/preview']);
    });
  }
}
