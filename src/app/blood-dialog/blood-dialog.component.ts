import { Component, OnInit } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-blood-dialog',
  templateUrl: './blood-dialog.component.html',
  styleUrls: ['./blood-dialog.component.scss']
})
export class BloodDialogComponent {

  constructor(private dialog: MdDialogRef<BloodDialogComponent>) { }

  ok() {
    this.dialog.close();
  }

}
