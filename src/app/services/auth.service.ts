import { Injectable, NgZone } from '@angular/core';
import { User } from '../entities/user';
import { User as FireUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth' ;
import * as auth from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  DocumentReference,
} from '@angular/fire/compat/firestore';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
// import { TimeHandler } from '../Entities/time-handler';
import * as firebase from 'firebase/compat';

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  userData: any;
  sub? : Subscription;

  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone,
    private _db : AngularFirestore
  ) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('auth', JSON.stringify(this.userData));
        this.sub = this._db.collection('users').doc(user.uid).get().subscribe(data => {
          localStorage.setItem('user', JSON.stringify(data.data()));
        //this.logUser('in');
        console.log("sign in")
      })
      } else {
        this.sub?.unsubscribe();
        //this.logUser('out');
        localStorage.setItem('auth', 'null');
        localStorage.setItem('user', 'null');

        console.log("sign out")

      }
    });
  }

   // Returns true when user is logged in and email is verified
   get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('auth')!);
    return user !== null;
  }

  get isVerified(): boolean {
    const user = JSON.parse(localStorage.getItem('auth')!);
    return user !== null && user.emailVerified;
  }

  get isAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null && user.isAdmin;
  }

  SignIn(email: string, password: string) : Promise<any> {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }


  // Sign up with email/password
  async SignUp(user : User, password : string) {
    try {
      let result = await this.afAuth.createUserWithEmailAndPassword(user.email,password);
      this.SendVerificationMail();
      await result.user!.updateProfile({displayName : user.nombre, photoURL : user.imagenes[0]});
      this.SetUserData(result.user!.uid, user);
      this.router.navigate(['home']);
      return new Promise((res, rej) => {
        res("success");
      })
    } catch (error) {
      return new Promise((res,rej)=> {
        res(JSON.parse(JSON.stringify(error)));
      })
    }
  }

  // Sign in with Google
  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());
  }

  // Auth logic to run auth providers
  AuthLogin(provider: any) {
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        let user = result.user;
        this.SetUserData(user!.uid,new User (user!.email!,user!.displayName ?? '','',0,'',[user!.photoURL ?? '']));
        console.log(result.user);
        this.router.navigate(['/home']);
      })
      .catch((error) => {
        // window.alert("An error occured when attemping sign in");
      });
  }

  SetUserData(uid : string, user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${uid}`
    );
    user.uid = uid;
    console.log("user updated in db");
    return userRef.set(JSON.parse( JSON.stringify(user)), {
      merge: true,
    });
  }

  // Sign out
  SignOut() {
    return this.afAuth.signOut().then(()=> {
    localStorage.removeItem('user');
    localStorage.removeItem('auth');
    });
  }

  SendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        // this.router.navigate(['verify-email-address']);
        console.log("correo de verificacion enviado");
      });
  }

  ForgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  async checkPassword(password : string) : Promise<boolean>{
    const user = await this.afAuth.currentUser;
    const credential = EmailAuthProvider.credential(
      user!.email!,
      password
    );
    let authenticated = true;
    try {
      await reauthenticateWithCredential(user!, credential);
      console.log("password looks good")
    } catch (error) {
      console.log("incorrect password")
      authenticated = false;
    } finally {
      return authenticated;
    }
  }

  

  // //logging
  // private logUser(inOrOut : 'in' | 'out'){
  //   let dateNow = new Date();
  //   let fecha = TimeHandler.formatDate(dateNow);
  //   let time = `${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds()}`;
  //   this._db.collection('logs').doc(this.userData.uid).get().subscribe(doc => {
  //     if(doc.exists){
  //       doc.ref.set({logs : [...((<{logs : any[]}>doc.data()).logs), { type : inOrOut, fecha : fecha, timestamp : time}]})
  //     } else {
  //       doc.ref.set({logs : [{ type : inOrOut, fecha : fecha, timestamp : time}]})
  //     }
  //   })
  // }

  // public getUserLogs(uid : string) {
  //   return this._db.collection('logs').doc(uid).get();
  // }

}