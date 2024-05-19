import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Feature } from 'src/app/interfaces/feature';
import { AngularMaterialModule } from 'src/app/material/angular-material.module';

@Component({
  selector: 'app-custom-buttons',
  templateUrl: './custom-buttons.component.html',
  styleUrls: ['./custom-buttons.component.scss'],
  standalone : true,
  imports: [IonicModule, CommonModule, AngularMaterialModule]
})
export class CustomButtonsComponent  implements OnInit, OnChanges {

  @Input() buttons : Feature[] = [];
  @Input() classWrapper : string = "";
  @Input() columns : number = 2;
  @Input() labelClass? : string = 'mat-headline';
  @Input() gutterSize? : string = "5%";
  @Input() rowHeight : string = '1:1';
  @Output() buttonClicked = new EventEmitter<Feature>();

  constructor() { }

  ngOnInit(): void {

  }

  ngOnChanges() : void{

  }

  buttonSelected(button : Feature){
    this.buttonClicked.emit(button);
  }

}
