import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { User } from 'src/app/entities/user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AngularMaterialModule } from '../material/angular-material.module';
import { SpinnerComponent } from "../components/spinner/spinner.component";
import { CustomButtonsComponent } from "../components/custom-buttons/custom-buttons.component";
import { Feature } from '../interfaces/feature';
import { mockUsers } from '../constants/mock-users';


@Component({
    selector: 'app-logni',
    templateUrl: './logni.page.html',
    styleUrls: ['./logni.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, RouterModule, ReactiveFormsModule, AngularMaterialModule, SpinnerComponent, CustomButtonsComponent]
})
export class LogniPage implements OnInit,OnDestroy {

  loginForm!: FormGroup;
  attemptingSingIn: boolean = false;
  hidePassword : boolean = true;
  invalidCredentials : boolean = false;
  mockUsersButtons : Feature[] = [];
  fabIsOpen : boolean = false;


  // constructor(public auth: Auth, private fb: FormBuilder, private _router : Router) { }
  constructor(public auth: AuthService, private _router : Router, private fb:FormBuilder, private toastController: ToastController) { 
    
  }

  ngOnInit(): void {
    mockUsers.forEach(usr => {
      this.mockUsersButtons.push({id: usr.uid!, color:'grey', label: usr.label, backgroundImg: usr.imagen})
    });
    this.loginForm = this.fb.group({
      email: ['',[Validators.required, Validators.email]],
      password: ['',[Validators.required]],
    });
    this.loginForm.valueChanges.subscribe(()=>{
      this.invalidCredentials = false;
    })
  }

  ngOnDestroy() {
    console.log('Cleared');
  }

loadLoginForm(selectedMockUser : Feature){
  let selectedUser : any =  mockUsers.find(u => u.uid == selectedMockUser.id)!;
  this.loginForm.get('email')?.setValue(selectedUser.email);
  this.loginForm.get('password')?.setValue(selectedUser.password);
}
  

  togglePasswordVisibility(){
    this.hidePassword = !this.hidePassword;
  }

  handleLogIn(){
    this.attemptingSingIn = true;
    this.auth.SignIn(
      this.loginForm.get('email')!.value,
      this.loginForm.get('password')!.value)
      .then(() => {
        this.auth.afAuth.authState.subscribe((user) => {
          if (user) {
            setTimeout(() => {
              this.attemptingSingIn = false;
              this.loginForm.get('email')?.setValue('');
              this.loginForm.get('password')?.setValue('');
              this._router.navigate(['/home']);
            }, 1500);
          }
        });
      })
      .catch((error) => {
        this.attemptingSingIn = false;
        this.invalidCredentials = true;
        this.presentToast("bottom","No pudimos verificar tus credenciales, por favor vuelve a ingresarlas.");
      });
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', displayMessage : string) {
    const toast = await this.toastController.create({
      message: displayMessage,
      duration: 2500,
      position: position,
      icon: 'alert-circle-outline',
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

  fabClicked(){
    this.fabIsOpen = !this.fabIsOpen;
  }
}

