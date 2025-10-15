import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { AdminContentComponent } from '../../pages/admin/admin-content.component';

@Component({
  selector: 'app-admin-modal',
  templateUrl: './admin-modal.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, AdminContentComponent]
})
export class AdminModalComponent implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() { }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
