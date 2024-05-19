import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class AppComponent implements OnInit {
  constructor(public _router : Router) {
  }

  ngOnInit(){
    setTimeout(() => {
      //make time for android unskippable icon screen to end
      this._router.navigateByUrl('splash');
    }, 1500);
  }
}
