import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'app-course-registration-reactive-component',
  standalone: false,
  styleUrl: './course-registration-reactive-component.css',
  templateUrl: './course-registration-reactive-component.html',
})
export class CourseRegistrationReactiveComponent {
 public regForm: FormGroup = new FormGroup(
  {
    name: new FormControl('Phạm Ngô Bảo Trân',
      [Validators.required, Validators.minLength(3), this.customNameValidator]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    confirmPass: new FormControl('', [Validators.required])
  },
  {
    validators: this.passwordMatchValidator
  }
);
  setDefaultValues(){
    this.regForm.patchValue({
      name: 'Phạm Ngô Bảo Trân',
      email:'tranpnbk24411e@st.uel.edu.vn',
      password: '',
      confirmPass: '',
    });
    this.regForm.markAsPristine();
    this.regForm.markAsUntouched();
  }
  customNameValidator(control: AbstractControl): { [key: string]: any } | null
{
    const name = String(control.value ?? '');
    if (!name) {
      return null;
    }

    return /^[\p{L}\p{M} ]+$/u.test(name)
      ? null
      : { nameNotMatch: { value: name } };
  }

  passwordStrengthValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = String(control.value ?? '');
    if (!password) {
      return null;
    }

    const missingRequirements = {
      uppercase: !/[A-Z]/.test(password),
      lowercase: !/[a-z]/.test(password),
      number: !/[0-9]/.test(password),
      specialCharacter: !/[^A-Za-z0-9\s]/.test(password),
    };

    return Object.values(missingRequirements).some(Boolean)
      ? { passwordRequirements: missingRequirements }
      : null;
  }
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPass = control.get('confirmPass');

  if (password && confirmPass && password.value !== confirmPass.value) {
    return { mismatch: true }; // Return a mismatch error for the entire FormGroup
  }
  return null;
}
  onSubmit() {
  if (this.regForm.valid) {
    console.log('Submitted data:', this.regForm.value);
    let infor=JSON.stringify(this.regForm.value);
    alert("Data processing:\n"+infor)
  }
}
}

