import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SplashPage implements OnInit {

  startTransitionOut : boolean = false;
  constructor(public router:Router) { }

  ngOnInit() {
    setTimeout(() => {
      this.startTransitionOut = true;
      this.transitionOut();
    }, 3000);
  }

  transitionOut(){
    setTimeout(() => {
      this.router.navigateByUrl('login');
    },1500);
  }
}
