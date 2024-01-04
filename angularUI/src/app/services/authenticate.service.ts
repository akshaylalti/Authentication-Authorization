import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenApiModel } from '../model/token-api.model';
@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {
  private baseUrl="https://localhost:7215/api/User/";
  private userPayload:any;
  constructor(private http:HttpClient , private router:Router , private https:HttpClientModule){
    this.userPayload = this.decodedToken();
  }
  signUP(userObj:any)
  {
    return this.http.post<any>(`${this.baseUrl}register`,userObj)
  }
  login(userObj:any){
    return this.http.post<any>(`${this.baseUrl}authenticate`,userObj)
  }

  storeToken(tokenValue : string){
    localStorage.setItem('token',tokenValue);
  }

  storeRefreshToken(tokenValue : string){
    localStorage.setItem('refreshToken',tokenValue);
  }

  getToken(){
    return localStorage.getItem('token');
  }

  getRefreshToken(){
    return localStorage.getItem('refreshToken');
  }

  isLogged():boolean{
    return !!localStorage.getItem('token');
  }

  signOut(){
    localStorage.clear();
    this.router.navigate(['login'])
  }

  decodedToken(){
    const jwtHealper = new JwtHelperService();
    const token = this.getToken()!;
    return jwtHealper.decodeToken(token);
  }

  getFullNameFromToken(){
    if(this.userPayload)
    return this.userPayload.name;
  }

  getRoleFromToken(){
    if(this.userPayload)
    return this.userPayload.role;
  }

  renewToken(tokenApi:TokenApiModel){
    return this.http.post<any>(`${this.baseUrl}refresh`,tokenApi)
  }
}
