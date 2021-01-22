import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {WorldComponent} from './world/world.component';
import {CountryComponent} from './country/country.component';
import { AddNewsComponent } from './add-news/add-news.component';

import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: "home", component: WorldComponent}, 
  //{ path: "country", component: CountryComponent}, 
  { path: "country/:id", component: CountryComponent},
  { path: "addNews", component: AddNewsComponent, canActivate: [AuthGuard]}, //guard: only if user signed in!!
  { path: "", pathMatch: "full", redirectTo: "home"},
  { path: "**", redirectTo: "home"} 
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: "reload"})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
