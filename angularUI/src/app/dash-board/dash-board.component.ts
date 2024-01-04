import { Component, OnInit } from '@angular/core';
import { LoginComponent } from '../components/login/login.component';
import { Router } from '@angular/router';
import { AuthenticateService } from '../services/authenticate.service';
import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-dash-board',
  templateUrl: './dash-board.component.html',
  styleUrls: ['./dash-board.component.css']
})
export class DashBoardComponent implements OnInit {
  users:any;
  public fullName:string = "";
  public role:string = "";
  firstname:string = "";
  lastname:string = "";
  email:any="";

  constructor( private singout:AuthenticateService, private api:ApiService, private user:UserService) { }

  ngOnInit(){
    this.api.getUser().
    subscribe(res=>{
      this.users = res;
      console.log(this.users)
    })

    this.user.getFullNameFromStore()
    .subscribe( val =>{
      let fullNameFromToken = this.singout.getFullNameFromToken();
      this.fullName = val || fullNameFromToken
    })

    this.user.getRoleFromStore()
    .subscribe( val =>{
      let roleFromToken = this.singout.getRoleFromToken();
      this.role = val || roleFromToken
    })
  }



  logout(){
    this.singout.signOut();
  }
}
