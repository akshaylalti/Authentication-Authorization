import { Component, OnInit } from '@angular/core';
import { AuthenticateService } from '../services/authenticate.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResetPasswordService } from '../services/reset-password.service';

@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.component.html',
  styleUrls: ['./reset-pass.component.css']
})
export class ResetPassComponent implements OnInit {
  type:string = "password";
  isText:Boolean = false;
  eyeIcon:string ="fa-eye-slash";
  FormSubmit!:FormGroup;
  constructor(private lg:AuthenticateService ,
     private router:Router ,
     private fbm:FormBuilder,
     private reset:ResetPasswordService
     ) { }

  ngOnInit(): void {
    this.FormSubmit = this.fbm.group({
      email:['',[Validators.required]],
      password:['',[Validators.required]],
      Confpassword:['',[Validators.required]]
    })
  }
  hideShoePass(){
    this.isText = ! this.isText;
    this.isText ? this.eyeIcon="fa-eye" : this.eyeIcon="fa-eye-slash";
    this.isText ? this.type ="text" :this.type = "password";
  }

  onsubmit(){
    if(this.FormSubmit.valid){
      this.reset.resetPassword(this.FormSubmit.value).subscribe({
        next:(res)=>{
          console.log(res);
        },
        error:(err)=>{
          console.log("not submitted")
        }
      })
    }
}
}
