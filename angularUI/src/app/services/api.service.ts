import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl:string = 'https://localhost:7215/api/User/';
  constructor(private http: HttpClient) { }
  getUser(){
    return this.http.get<any>(this.baseUrl);
  }
}
