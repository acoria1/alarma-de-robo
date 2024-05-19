import { Component, OnDestroy, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccelListenerEvent, Motion } from '@capacitor/motion';
import { CapacitorFlash } from '@capgo/capacitor-flash';
import { BehaviorSubject } from 'rxjs';
import { Haptics } from '@capacitor/haptics';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio';
import { AudioService } from '../services/audio.service';
import { audios } from '../constants/audios';
import { PluginListenerHandle } from '@capacitor/core/types/definitions';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, SpinnerComponent, CommonModule],
})
export class HomePage implements OnInit, OnDestroy{
  signingOut : boolean = false;
  alarmaActivada : boolean = false;
  phoneOrientation! : BehaviorSubject<'horizontal' | 'vertical' | null>;
  phoneHorizontalMove! : BehaviorSubject<'left' | 'right' | null>;
  alarmOngoing = false;
  listenerHandler? : PluginListenerHandle;
  @ViewChild('alert-input-password',{static : false}) passwordInput? : ElementRef;
  hidePassword : boolean = true;
  specialAlertOngoing = false;

  //bugs a resolver
  // 
  // despues de desactivar la alarma no podemos volver a activarla. El removeallListeners arruina todo.
  constructor(public _auth: AuthService, private _router : Router, private _audioService : AudioService, private alertController : AlertController, private renderer : Renderer2) {}

  ngOnInit(): void {
    this.phoneOrientation = new BehaviorSubject<'horizontal' | 'vertical' | null>(null);
    this.phoneOrientation.subscribe((orientation)=>{
      console.log("orientation next value received:",orientation);
      if(orientation === 'vertical'){
        this.handleVerticalOrientation()
      }
      if(orientation === 'horizontal'){
        this.handleHorizontalOrientation()
      }
    });
    this.phoneHorizontalMove = new BehaviorSubject<'left' | 'right' | null>(null);
    this.phoneHorizontalMove.subscribe((movimiento)=>{
      console.log("movimiento next value received:",movimiento);
      if (movimiento === 'left'){
        this.handleLeftMovement();
      }
      if (movimiento === 'right'){
        this.handleRightMovement();
      }
    });
  }

  handleVerticalOrientation(){
    //prender flash por 5 segundos
    this.alarmOngoing = true;
    CapacitorFlash.switchOn({intensity : 100});
    //pasar sonido alusivo
    this._audioService.loopComplexAudio("verticalAudio",audios.verticalAudio,100,5000);
    //apagar flash
    setTimeout(() => {
      CapacitorFlash.switchOff();
      this.alarmOngoing = false;
    }, 5100);
  }

  handleHorizontalOrientation(){
    this.alarmOngoing = true;
    Haptics.vibrate({duration : 5000});
    //pasar sonido alusivo
    this._audioService.loopComplexAudio("horizontalAudio",audios.horizontalAudio,100,5000);
    setTimeout(() => {
      this.alarmOngoing = false;
    }, 5100);
  }

  handleRightMovement(){
    this.alarmOngoing = true;
    //pasar sonido alusivo
    NativeAudio.preloadSimple("rightAudio",audios.rightAudio).then(() => {
      NativeAudio.play("rightAudio",() => {
        NativeAudio.unload("rightAudio");
        this.alarmOngoing = false;
      })
    })
  }

  handleLeftMovement(){
    this.alarmOngoing = true;
    //pasar sonido alusivo
    NativeAudio.preloadSimple("leftAudio",audios.leftAudio).then(() => {
      NativeAudio.play("leftAudio",() => {
        NativeAudio.unload("leftAudio");
        this.alarmOngoing = false;
      }) 
    })
  }

  async onAlarmaBtnClick(){
    if(!this.alarmaActivada){
      this.turnAlarmOn();
    } else {
      this.handleAlarmOff();
    }
  }

  turnAlarmOn(){
    this.alarmaActivada = true;
    Motion.addListener('accel', this.handleMotionEvent).then((listenerHandler)=>this.listenerHandler = listenerHandler).catch(() =>"failed adding event listener");
  }

  handleMotionEvent = (event : AccelListenerEvent)  => {
    if(!this.alarmOngoing && this.alarmaActivada){
        // Access the acceleration data
      const accelerationX = event.acceleration.x;
      if (accelerationX > 0.5 && this.phoneHorizontalMove?.value !== "left") {
        this.phoneHorizontalMove?.next('left');
      } else if (accelerationX < -0.5 && this.phoneHorizontalMove?.value !== "right") {
        this.phoneHorizontalMove?.next('right');
      }
      // 9.8 when phone is horizontal, 0 when phone is vertical
      const verticalDegrees = event.accelerationIncludingGravity.z;
      if(verticalDegrees > 9.5 && this.phoneOrientation?.value === "vertical"){
        this.phoneOrientation?.next('horizontal');
      }
      if(verticalDegrees < 2.5 && verticalDegrees > (-2) && this.phoneOrientation?.value !== "vertical"){
        this.phoneOrientation?.next('vertical');
      }
    }
  };

  async handleAlarmOff(){
    const alert = await this.alertController.create({
      header : "Ingresar Contraseña",
      subHeader : "Contraseña de inicio de sesión",
      buttons : [
        {
          text : "Cancelar", 
          role : 'cancel',
          cssClass : "alert-button-cancel"
        },
        {
          text : "Confirmar",
          role : 'confirm',
          cssClass : "alert-button-confirm",
          handler : (alertData) => {
            this._auth.checkPassword(alertData.password).then((correct)=> {
              if (correct){
                this.turnAlarmOff();
              } else {
                this.triggerSpecialAlert();
              }
            });
          }
        }
      ],
      inputs : [{
        name : 'password',
        placeholder : "contraseña",
        id : "alert-input-password",
        type : "password",
        cssClass : "alert-input-text",
      }],
      backdropDismiss : false,
      cssClass : "custom-alert"
    });
    await alert.present();
  }

  turnAlarmOff(){
    //stop even listening
    this.listenerHandler?.remove();
    //set flag
    this.alarmOngoing = false;
    this.alarmaActivada = false;
    //turn off flash
    CapacitorFlash.switchOff().catch((e)=> console.log(e));
    //stop all sounds
    this.cancelAudios();
    // reset subjects
    this.phoneHorizontalMove?.next(null);
    this.phoneOrientation?.next(null);
  }

  cancelAudios(){
    this._audioService.stopAudio("verticalAudio");
    this._audioService.stopAudio("horizontalAudio");
    this._audioService.stopAudio("rightAudio");
    this._audioService.stopAudio("leftAudio");
    this._audioService.stopAudio("errorAudio");
  }

  triggerSpecialAlert(){
    this.alarmOngoing = true;
    this.specialAlertOngoing = true;
    //flashlight
    CapacitorFlash.switchOn({intensity : 100});
    //vibration
    Haptics.vibrate({duration : 5000});
    //sound
    this._audioService.loopComplexAudio("errorAudio",audios.error,100,5000);
    setTimeout(() => {
      CapacitorFlash.switchOff();
      this.alarmOngoing = false;
      this.specialAlertOngoing = false;
    }, 5100);
  }

  // addPasswordIcon(){
  //   console.log("input ?", this.passwordInput);
  //   if(this.passwordInput){
  //     const ionButton = this.renderer.createElement('ion-button');
  //     this.renderer.setAttribute(ionButton, 'size', 'default');
  //     this.renderer.setAttribute(ionButton, 'slot', 'end');
  //     this.renderer.setAttribute(ionButton, 'fill', 'clear');
  //     this.renderer.addClass(ionButton, 'pt-3');
  //     this.renderer.addClass(ionButton, 'icon-button');
  //     this.renderer.listen(ionButton, 'click', () => this.togglePasswordVisibility());

  //     const ionIcon = this.renderer.createElement('ion-icon');
  //     this.renderer.setAttribute(ionIcon, 'name', this.hidePassword ? 'eye-off-outline' : 'eye-outline');
  //     this.renderer.setAttribute(ionIcon, 'color', 'warning');
  //     this.renderer.addClass(ionIcon, 'iconEye');

  //     this.renderer.appendChild(ionButton, ionIcon);
  //     this.renderer.appendChild(this.passwordInput!.nativeElement, ionButton);
  //   }
  // }

  togglePasswordVisibility(){
    this.hidePassword = !this.hidePassword;
  }

  async handleSignOut(){
    this.signingOut = true;
    await setTimeout(() => {
        this._auth.SignOut().then(() => {
          this._router.navigate(['login']);
        });
      }, 2000);
    }

  ngOnDestroy(): void {
    this.listenerHandler?.remove().catch((e)=>console.log("handler was already closed beforehand"));
  }
}



