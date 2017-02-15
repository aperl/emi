import { Component, AfterViewInit, OnInit, ElementRef, Output, Input, EventEmitter } from '@angular/core';
import * as Cropper from 'cropperjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-photo-upload',
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.scss']
})
export class PhotoUploadComponent implements OnInit, AfterViewInit {
  @Output() photoChanged: EventEmitter<Blob> = new EventEmitter();
  @Output() cropChanged: EventEmitter<Cropper.Data> = new EventEmitter();
  @Input() cropData: Cropper.Data;
  @Input() photo: Blob;
  img: SafeUrl;

  private cropper;

  constructor(private element: ElementRef, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    if (this.photo) {
      this.img = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(this.photo));
    }
  }

  ngAfterViewInit() {
    let img = (this.element.nativeElement as HTMLElement).querySelector('.image') as HTMLImageElement;
    this.cropper = new Cropper(img, {
      aspectRatio: 3.0 / 4.0,
      zoomable: false,
      movable: false,
      background: false,
      guides: false,
      highlight: false,
      data: this.cropData,
      toggleDragModeOnDblclick: false,
      crop: (event) => {
        this.cropChanged.emit(event.detail);
      }
    });
  }

  getImage(): Promise<Blob> {
    return new Promise((resolved) => {
      let canvas = this.cropper.getCroppedCanvas({
        width: 450,
        height: 600
      });
      if (canvas) {
        canvas.toBlob(resolved, 'image/jpeg', 0.9);
      } else {
        resolved(null);
      }
    });
  }

  attachPhoto(event: Event) {
    let el = event.currentTarget as HTMLInputElement;
    this.setPhoto(el.files.item(0));
  }

  setPhoto(photo: Blob) {
    try {
      let photoUrl = window.URL.createObjectURL(photo);
      this.cropper.replace(photoUrl);
      this.photoChanged.emit(photo);
    } catch (e) {
      console.log(e);
    }
  }
}
