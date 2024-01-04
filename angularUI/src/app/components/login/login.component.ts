import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { AuthenticateService } from 'src/app/services/authenticate.service';
import { ResetPasswordService } from 'src/app/services/reset-password.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  type:string = "password";
  isText:Boolean = false;
  eyeIcon:string ="fa-eye-slash";
  Form!:FormGroup;
  public resetPasswordEmail!:string;
  public isValidEmail!:boolean;
  constructor(private fb:FormBuilder ,
     private lg:AuthenticateService ,
     private router:Router,
     private user:UserService,
     private toast: NgToastService,
     private reset:ResetPasswordService
     ) {

  }

  ngOnInit(): void {
    this.Form = this.fb.group({
      username:['',[Validators.required]],
      password:['',[Validators.required]]
    })
  }
  hideShoePass(){
    this.isText = ! this.isText;
    this.isText ? this.eyeIcon="fa-eye" : this.eyeIcon="fa-eye-slash";
    this.isText ? this.type ="text" :this.type = "password";
  }
  submit(){}

  login(){
   if(this.Form.valid){
    this.lg.login(this.Form.value).subscribe(
      {
        next:(res)=>{
        alert("Login Sucess")
        this.Form.reset();
        this.lg.storeToken(res.accessToken);
        this.lg.storeRefreshToken(res.refreshToken);
        const tokenPayload = this.lg.decodedToken();
        this.user.setFullNameFromStore(tokenPayload.name);
        this.user.setRoleFormStore(tokenPayload.role);
        this.router.navigate(['dashBoard']);
      },
    error:(err)=>{
      alert(err.message)
      this.toast.error({detail:"ERROR",summary:err.message,duration:5000});
    }})
   }
  }

  checkValidEmail(event:any){
    const val =event;
    const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    this.isValidEmail = pattern.test(val);
    return this.isValidEmail;
  }

  conformToSend(){
    if(this.checkValidEmail(this.resetPasswordEmail)){
      console.log(this.resetPasswordEmail)


      this.reset.sendRequestPasswordLink(this.resetPasswordEmail)
      .subscribe({
        next:(res)=>{
          this.resetPasswordEmail = "";
          const btnref = document.getElementById("closeBtn");
          btnref?.click();
          alert(" reset mail send");
        },
        error:(err)=>{
          alert("Not send")
        }
      })
    }
  }
}
