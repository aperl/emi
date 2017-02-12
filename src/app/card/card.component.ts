import { Component, OnInit, Input } from '@angular/core';
import * as googlePhoneLib from 'google-libphonenumber';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() data: any;
  @Input() imageUrl: string;

  phoneUtils = new googlePhoneLib.PhoneNumberUtil();

  constructor() { }

  ngOnInit() {
  }

  formatPhone(number: string) {
    try {
      return this.phoneUtils.format(this.phoneUtils.parse(number, 'US'), googlePhoneLib.PhoneNumberFormat.NATIONAL);
    } catch (e) {
      return number;
    }
  }

}
