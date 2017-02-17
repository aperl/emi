import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-print-dialog',
  templateUrl: './print-dialog.component.html',
  styleUrls: ['./print-dialog.component.scss']
})
export class PrintDialogComponent {

  constructor(private dialog: MdDialogRef<PrintDialogComponent>) {

  }

  cancel() {
    this.dialog.close(false);
  };

  print() {
    this.dialog.close(true);
  }




}
