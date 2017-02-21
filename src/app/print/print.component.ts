import { Component, OnInit } from '@angular/core';
import { DataService, ICard } from '../data.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class PrintComponent implements OnInit {

  cards: ICard[] = [];

  constructor(private data: DataService) {
    this.updateCards();
  }

  updateCards() {
    this.data.getCards({ printed: false }).subscribe((cards) => {
      this.cards = _.flatMap(cards, card => _.fill(Array(card.count), card));
    });
  }

  printed() {
    this.data.markAsPrinted(this.cards).then(() => {
      this.updateCards();
    });
  }

  ngOnInit() {
  }

}
