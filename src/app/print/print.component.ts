import { Component, OnInit } from '@angular/core';
import { DataService, ICard } from '../data.service';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class PrintComponent implements OnInit {

  cards: ICard[] = [];

  constructor(data: DataService) { 
    data.getAllCards().then((cards) => {
      this.cards = cards;
    })
  }

  ngOnInit() {
  }

}
