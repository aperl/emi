import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DataService } from '../data.service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  card: any;
  imgUrl: SafeUrl;
  pending = false;

  constructor(
    private data: DataService,
    private sanitizer: DomSanitizer,
    private router: Router) {

    if (!data.formValue || !data.valid) {
      router.navigate(['/']);
    }

    this.card = data.formValue;
    if (this.data.croppedImage) {
      this.imgUrl = sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(this.data.croppedImage));
    }
  }

  print() {
    window.print();
  }

  upload() {
    this.pending = true;
    this.data.sendData().then((v) => {
      this.router.navigate(['/success']);
      this.pending = false;
    }, (error) => {
      alert("Error: Let Allen Know something is broken (allenperl@gmail.com)\n" + error.toString());
      this.pending = false;
    });
  }

  ngOnInit() {
  }

}
