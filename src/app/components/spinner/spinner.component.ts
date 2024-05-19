import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  standalone: true,
  imports : [IonicModule, CommonModule]
})
export class SpinnerComponent  implements OnInit {

  @Input() optionalMessage? : string = "";
  @Input() spinnerType? : string = "lines-sharp"

  constructor() { }

  ngOnInit() {}

}
