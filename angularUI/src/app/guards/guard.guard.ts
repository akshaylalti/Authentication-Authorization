import { Injectable } from '@angular/core';
import {CanActivate, Router } from '@angular/router';
import { AuthenticateService } from '../services/authenticate.service';

@Injectable({
  providedIn: 'root'
})
export class GuardGuard implements CanActivate {
  constructor(private auth:AuthenticateService, private route:Router){}
  canActivate():boolean {
    if(this.auth.isLogged()){
      return true;
    }
    else{
      alert("Please login first");
      this.route.navigate(['login'])
    return false;
  }
  }
}
