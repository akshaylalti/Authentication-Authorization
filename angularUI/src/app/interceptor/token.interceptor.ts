import { Injectable } from '@angular/core';
import { TokenApiModel } from '../model/token-api.model';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthenticateService } from '../services/authenticate.service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private auth: AuthenticateService, private route: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const myToken = this.auth.getToken();
    if (myToken) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${myToken}` },
      });
    }
    return next.handle(request).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            // alert('Token is expired , Please login again!');
            // this.route.navigate(['login']);
            return this.handleUnAuthorizedError(request,next);
          }
        }
        return throwError(() => new Error(err.error.message));
      })
    );
  }

  handleUnAuthorizedError(req: HttpRequest<any>, next: HttpHandler) {
    let tokeApiModel = new TokenApiModel();

    tokeApiModel.accessToken == this.auth.getToken()!;
    tokeApiModel.refreshToken = this.auth.getRefreshToken()!;

    return this.auth.renewToken(tokeApiModel).pipe(
      switchMap((data: TokenApiModel) => {
        this.auth.storeRefreshToken(data.refreshToken);
        this.auth.storeToken(data.accessToken);
        req = req.clone({
          setHeaders: { Authorization: `Bearer ${data.accessToken}` },
        });
        return next.handle(req);
      }),
      catchError((err) => {
        return throwError(() => {
          alert('Token is expired , Please login again!');
          this.route.navigate(['login']);
        });
      })
    );
  }
}
