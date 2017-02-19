import { Component, OnInit, Input } from '@angular/core';
import { ICard} from '../data.service';
import * as googlePhoneLib from 'google-libphonenumber';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() data: ICard;
  @Input() imageUrl: string;

  date = new Date().toLocaleDateString();

  get middle() {
    if (!this.data || !this.data.middleName) {
      return '';
    // } else if (/^[a-zA-Z]/.test(this.data.middleName)) {
    //   return this.data.middleName[0].toUpperCase();
    } else {
      return this.data.middleName;
    }
  }

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
