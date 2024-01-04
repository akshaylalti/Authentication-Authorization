import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {
  private baseUrl:string = "https://localhost:7215/api/User";
  constructor(private http:HttpClient) {}

  sendRequestPasswordLink(Email :string){
    return this.http.post<any>(`${this.baseUrl}/send-reset-email/${Email}`,{});
  }

  resetPassword(resetPassword:string){
    return this.http.post<any>(`${this.baseUrl}/reset-password`,resetPassword);
  }
}
