import { Component, AfterViewInit, ElementRef, Output, EventEmitter } from '@angular/core';
import * as Cropper from 'cropperjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-photo-upload',
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.scss']
})
export class PhotoUploadComponent implements AfterViewInit {
  private _cropper;
  @Output() photoChanged: EventEmitter<Blob> = new EventEmitter();
  @Output() cropChanged: EventEmitter<Cropper.Data> = new EventEmitter();

  constructor(private element: ElementRef, private sanitizer: DomSanitizer) { }

  ngAfterViewInit() {
    let img = (this.element.nativeElement as HTMLElement).querySelector('.image') as HTMLImageElement;
    this._cropper = new Cropper(img, {
      aspectRatio: 3.0 / 4.0,
      zoomable: false,
      movable: false,
      background: false,
      guides: false,
      highlight: false,
      toggleDragModeOnDblclick: false,
      crop: (event) => {
        this.cropChanged.emit(event.detail);
      }
    });
  }

  get cropper(): Cropper {
    return this._cropper;
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
