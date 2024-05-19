import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class CustomValidator {

    public static checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => { 
        let pass = group.get('password')!.value;
        let confirmPass = group.get('confirmPassword')!.value
        return (pass === confirmPass) ? null : { notSame: true }
        }
    
    public static spacesValidator(control : AbstractControl): null | object {
        const username = <string>control.value;
        const spaces = username.includes(' ');

        return spaces ? {containsSpaces: true} : null;
    }
}