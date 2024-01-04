import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticateService } from 'src/app/services/authenticate.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  type:string = "password";
  isText:Boolean = false;
  eyeIcon:string ="fa-eye-slash";
  FormSubmit!:FormGroup;
  constructor(private fbm:FormBuilder, private lg:AuthenticateService , private router:Router){}

  ngOnInit(): void {
    this.FormSubmit = this.fbm.group({
      firstname:['',[Validators.required]],
      lastName:['',[Validators.required]],
      email:['',[Validators.required]],
      username:['',[Validators.required]],
      password:['',[Validators.required]]
    })

  }
  hideShoePass(){
    this.isText = ! this.isText;
    this.isText ? this.eyeIcon="fa-eye" : this.eyeIcon="fa-eye-slash";
    this.isText ? this.type ="text" :this.type = "password";
  }
  submit(){
    console.log(this.FormSubmit.value);
  }

  onsubmit(){
    if(this.FormSubmit.valid){
     console.log(this.FormSubmit.value);
     this.lg.signUP(this.FormSubmit.value).subscribe(
      {
        next:(res)=>{
       alert(res.message)
       this.FormSubmit.reset();
       this.router.navigate(['login'])
     },
     error:(err)=>{
       alert(err.message)
     }})
    }
}
}
