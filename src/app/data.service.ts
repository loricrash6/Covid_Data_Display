import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import firebase from 'firebase/app';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth} from '@angular/fire/auth';
import { world_data } from './world_data';
import { User } from './user';
import { News } from './news';
import {DatePipe} from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient, private router: Router, private firestore : AngularFirestore,
    private afAuth: AngularFireAuth,private datepipe: DatePipe) { }

  apiUrl = 'https://api.covid19api.com/';
  public country: string;
  private user: User;
  public isSuperUser: boolean;
  public slug: string;
  
  getWorldData() {
    return this.http.get(this.apiUrl+"summary")
  }

  getTotLast7Days(iscountry) {

    var today = new Date();
    let t = this.datepipe.transform(today.setDate(today.getDate()),"yyyy-MM-dd");

    var from = new Date();

    if(iscountry === 0){
      //world data API DOES NOT WORK!
      //removed to use new API
      /*
      from.setDate(today.getDate()-7); //we use data from 7 days ago to yesterday!
      let f = this.datepipe.transform(from.setDate(from.getDate()),"yyyy-MM-dd");
      //console.log(this.apiUrl+"world?from="+f+"&to="+t);
      return this.http.get(this.apiUrl+"world?from="+f+"&to="+t)*/

      //NEW API!
      return this.http.get("https://corona.lmao.ninja/v2/historical/all?lastdays=8")
    } else {
        //country data
        from.setDate(today.getDate()-8); //last 8 days (8th for comparison)

        let f = this.datepipe.transform(from.setDate(from.getDate()),"yyyy-MM-dd");

        //return this.http.get(this.apiUrl+"total/country/"+this.country+"?from="+f+"&to="+t)
        //console.log(this.apiUrl+"total/country/"+this.slug+"?from="+f+"&to="+t);
        return this.http.get(this.apiUrl+"total/country/"+this.slug+"?from="+f+"&to="+t)
    }
    
  }

  gotoCountry(c){
    this.router.navigate(["country/"+c.toLowerCase()]);
    //this.router.navigate(["country/"+c]);
    this.country=c;
  }

  //gets slug for current country and sets it on our service
  //always executed first in ngOnInit of country page, we need it for the other operaitions!
  async getSlugs(){
    //return this.http.get(this.apiUrl+"countries");
    var res = await this.http.get(this.apiUrl+"countries").toPromise().then(data => {
      //console.log(this.country);
      for(let i=0;i<Object.keys(data).length;i++){
        if(this.country.toLowerCase() == data[i]["Country"].toLowerCase()){
          //console.log(data[i]["Country"]);
          //if(this.country == data[i]["Country"]){
          this.slug = data[i]["Slug"];
          //console.log(this.slug);
        }
      }
    });
    return this.slug;
  }

  backToWorld(){
    this.router.navigate(["world"]);
  }

  getCountry(){
    return this.country
  }

  findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr].toLowerCase() === value.toLowerCase()) {
          //if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}

  getDay1Data(iscountry){
    if(iscountry===1){
      //var day1_url = this.apiUrl+"total/dayone/country/"+this.country;
      var day1_url = this.apiUrl+"total/dayone/country/"+this.slug;

      return this.http.get(day1_url)
    } else {
      var today = new Date();
      //var day1_url =this.apiUrl+"world?to="+today; CHENGED BECAUSE API DOES NOT WORK!
      var day1_url = "https://corona.lmao.ninja/v2/historical/all";

      return this.http.get(day1_url)
    }
  }

  getLastCountryUpdate(c){
    var co = String(c).toLowerCase();
    //var co = String(c);
    return this.firestore.collection("countries").doc(co).valueChanges();
  }

  pushCountryData(data: world_data, c: any){
    this.firestore.collection("countries").doc(c.toLowerCase()).set({
    //this.firestore.collection("countries").doc(c).set({
      NewConfirmed: data.new_cases,
      TotalConfirmed: data.tot_cases,
      NewDeaths: data.new_deaths,
      TotalDeaths: data.tot_deaths,
      NewRecovered: data.new_recovered,
      TotalRecovered: data.tot_recovered,
      LastUpdated: new Date()
    });
  }

  //user sign in
  async signInWithGoogle(){
    const credientals = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); 
    this.user = {
       uid: credientals.user.uid,
       displayName: credientals.user.displayName,
       email: credientals.user.email
     };
     localStorage.setItem("user", JSON.stringify(this.user));
     this.updateUserData();
     this.router.navigate(["world"]);
     window.location.reload(); //added to refresh page!
   }

   private updateUserData(){
    this.firestore.collection("users").doc(this.user.uid).set({
      uid: this.user.uid,
      displayName: this.user.displayName,
      email: this.user.email
    }, { merge: true});
  }

  getUser(){
    if(this.user == null && this.userSignedIn()){
      this.user = JSON.parse(localStorage.getItem("user"));
    }
    return this.user;
  }

  userSignedIn(): boolean{
    return JSON.parse(localStorage.getItem("user")) != null;
  }

  signOut(flag){
    if(flag==1){
      //log out from country
      this.afAuth.signOut();
      localStorage.removeItem("user");
      this.user = null;
      this.router.navigate(["home"]);
    } else {
      //log out from world
      this.afAuth.signOut();
      localStorage.removeItem("user");
      this.user = null;
      this.router.navigate(["home"]);
      window.location.reload(); //added to refresh page!
    }
  }

  checkIfSuperUser() {
    //var super_users = []
    //console.log(this.user.email);
    this.firestore.collection("super_users").valueChanges()
    .subscribe(queriedItems => {
      for(let i=0; i<Object.keys(queriedItems).length;i++){
        //console.log(queriedItems[i]["email"]);
        //super_users.push(queriedItems[i]["email"]);
        if (String(this.user.email) == String(queriedItems[i]["email"])){
          this.isSuperUser = true;
          //console.log(this.isSuperUser);
          break;
          }
        }
      }
    );
    //console.log(super_users);
  }

  //news addition in DB
  addNews(news: News){
    let newId = this.firestore.createId();
    this.firestore.collection("news").doc(newId).set({
      author: news.author.displayName,
      country: news.country.toLowerCase(),
      content: news.content,
      date: news.date
    }, { merge: true});

    this.router.navigate(["home"]);
  }

  goToNews(){
    this.router.navigate(["addNews"]);
  }

  //retrieve news from DB to display them
  getNews(){
    return this.firestore.collection("news",ref => ref.orderBy('date', 'desc')).valueChanges();
  }

}



