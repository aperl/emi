import { Component, OnInit, ElementRef} from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { DataService } from '../data.service';
import { MdDialog } from '@angular/material';
import { PrintDialogComponent } from '../print-dialog/print-dialog.component';

function countValidator(ctrl: AbstractControl): { [key: string]: any } {
  let val = parseInt(ctrl.value, 10);
  if(val < 1 || val > 5) {
    return { count: true };
  }

  return null;
}


@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {

  card: any;
  imgUrl: SafeUrl;
  pending = false;
  form: FormGroup;
  printed = false;

  cards: boolean[] = [];

  constructor(
    private data: DataService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private fb: FormBuilder,
    private element: ElementRef,
    private dialog: MdDialog) {

    if (!data.formValue || !data.valid) {
      router.navigate(['/']);
    }

    this.form = fb.group({
      count: [1, [Validators.required, countValidator]]
    });

    this.form.get('count').valueChanges.subscribe((value) => {
      let count = parseInt(value, 10);
      if (count >= 1 && count <= 5) {
        this.cards = [];
        for (let i = 0; i < count - 1; i++) {
          this.cards.push(true);
        }
      }

    });

    this.card = data.formValue;
    if (this.data.croppedImage) {
      this.imgUrl = sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(this.data.croppedImage));
    }
  }

  next() {
    this.data.clearData();
    this.router.navigate(['/']);
  }

  print() {
    let dialog = this.dialog.open(PrintDialogComponent);
    dialog.afterClosed().subscribe((isPrint) => {
      if (isPrint) {
        window.print();
        this.data.sendPrint();
        this.printed = true;
      }
    });
  }

  upload() {
    if (this.form.invalid) {
      let input = (this.element.nativeElement as HTMLElement).querySelector('md-input.ng-invalid input') as HTMLInputElement;
      input.select();

      return;
    }
    this.pending = true;
    this.data.sendData().then((v) => {
      this.router.navigate(['/success']);
      this.pending = false;
    }, (error) => {
      alert("Error: Please let Allen know something is broken (allenperl@gmail.com)\n\n" + error.toString());
      this.pending = false;
    });
  }

  ngOnInit() {
  }

}
