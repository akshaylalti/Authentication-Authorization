import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { DashBoardComponent } from './dash-board/dash-board.component';
import { GuardGuard } from './guards/guard.guard';
import { ResetPassComponent } from './reset-pass/reset-pass.component';

const routes: Routes = [
    { path:'login',component:LoginComponent},
    { path: 'signup', component:SignupComponent },
    { path:'', component:LoginComponent},
    {path:'dashBoard', component:DashBoardComponent, canActivate:[GuardGuard]},
    {path:'reset' , component:ResetPassComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

 }
