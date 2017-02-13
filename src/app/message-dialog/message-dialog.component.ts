import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent {

  constructor(private dialog: MdDialogRef<MessageDialogComponent>) {

  }

  cancel() {
    this.dialog.close(false);
  };

  print() {
    this.dialog.close(true);
  }




}
