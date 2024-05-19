import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { User } from '../entities/user';
import { AngularMaterialModule } from '../material/angular-material.module';
import { CustomValidator } from '../entities/custom-validator';
import { SpinnerComponent } from "../components/spinner/spinner.component";

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, RouterModule, ReactiveFormsModule, AngularMaterialModule, SpinnerComponent]
})
export class RegisterPage implements OnInit, OnDestroy {

  signUpForm!: FormGroup;
  attemptingSingUp: boolean = false;
  hidePassword : Boolean[] = [true,true];
  invalidCredentials : boolean = false;
  emailAlreadyInUse = false;
  invalidEmail = false;


  // constructor(public auth: Auth, private fb: FormBuilder, private _router : Router) { }
  constructor(public auth: AuthService, private _router : Router, private fb:FormBuilder, private toastController: ToastController) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      'nombre' : ['', Validators.required],
      'email' : ['', [Validators.required, Validators.email]],
      'password' : ['', [Validators.required,Validators.pattern('((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,30})')]],
      'confirmPassword' : ['', [Validators.required,Validators.pattern('((?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,30})')]]
    }, { validators: CustomValidator.checkPasswords});
    
    this.signUpForm.valueChanges.subscribe(()=>{
      this.emailAlreadyInUse = false;
      this.invalidEmail = false;
    })    
  }

  @HostListener('unloaded')
  ngOnDestroy() {
    console.log('Cleared');
}

  togglePasswordVisibility(index : number){
    this.hidePassword[index] = !this.hidePassword[index];
  }

  handleRegister(){
    this.attemptingSingUp = true;
    this.auth.SignUp(new User(this.signUpForm.get('email')!.value, this.signUpForm.get('nombre')!.value, "Apellido",18,"21313123",[]), this.signUpForm.get('password')!.value)
    .then((response)=>{
      if (response == "success"){
        setTimeout(() => {
          this._router.navigate(['home']);
        }, 2200);          
      } else {
        this.attemptingSingUp = false;
        if ((<{ code : string, customData : any, name : string}>response).code === "auth/email-already-in-use"){
          this.emailAlreadyInUse = true;
          this.presentToast("bottom","El email ya está en uso");
        } 
        else if ((<{ code : string, customData : any, name : string}>response).code === "auth/invalid-email"){         
          this.invalidEmail = true;
          this.presentToast("bottom","El email ingresado tiene un formato inválido");
        }  
      }
    });
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', displayMessage : string) {
    const toast = await this.toastController.create({
      message: displayMessage,
      duration: 2500,
      position: position,
      icon: 'alert-outline',
      buttons : [
        {
          text: 'Minimizar',
          role: 'cancel'
        }
      ],
      color : 'warning'
    });

    await toast.present();
  }

  handleGoogleAuth(){
    this.auth.GoogleAuth(); 
  }
}
