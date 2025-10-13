import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { SharedHeaderComponent } from '../components/shared-header/shared-header.component';

@Component({
  selector: 'app-administracion',
  templateUrl: './administracion.page.html',
  styleUrls: ['./administracion.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, SharedHeaderComponent]
})
export class AdministracionPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
