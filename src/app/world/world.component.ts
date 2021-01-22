import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import {world_data} from '../world_data';

import { ChartType, ChartOptions, ChartDataSets} from 'chart.js';
import { Label, Color} from 'ng2-charts';
import { Subscriber } from 'rxjs';
import {DatePipe} from '@angular/common';
import { User } from '../user';
import { News } from '../news';

import {faChevronUp, faChevronDown, faChevronCircleUp, faChevronCircleDown, faTable} from '@fortawesome/free-solid-svg-icons';
import { FlexAlignStyleBuilder } from '@angular/flex-layout';
import { CountryComponent } from '../country/country.component';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements OnInit {

  global_data: world_data;
  countries: any;
  country: string;
  userSignedIn: boolean;
  isSuperUser: boolean;
  user: User;
  news: News[];

  // Pie chart items
  pieChartOptions: ChartOptions = {
    responsive: true,
  };
  pieChartLabels: Label[] = ["Active Cases", "Recovered Cases", "Dead Cases"];
  pieChartData: any;
  pieChartType: ChartType = 'pie';
  pieChartLegend = true;
  pieChartPlugins = [];
  pieChartColor: any[] = [{backgroundColor: ["gold","dodgerblue","lightcoral"]}];

  //Bar chart items
  barChartOptions: ChartOptions = {
    responsive: true,
  };
  barChartLabels: Label[] = [];
  barChartType: ChartType = 'bar';
  barChartLegend = true;
  barChartPlugins = [];
  barChartData: ChartDataSets[] = [];
  barChartColors: Color[] = [
    { backgroundColor: 'lightcoral' },
    { backgroundColor: 'dodgerblue' },
    { backgroundColor:  'gold'}
  ]

  //line chart items
  public lineChartData: ChartDataSets[] = [];
  public lineChartLabels: Label[] = [];
  //public lineChartOptions: (ChartOptions & { annotation: any }) = {};
  public lineChartColors: Color[] = [
    {
      borderColor: 'gold',
      backgroundColor: 'rgba(255, 215, 0,0.5)',
    },
    {
      borderColor: 'lightcoral',
      backgroundColor: 'rgba(240, 128, 128,0.5)',
    },
    {
      borderColor: 'dodgerblue',
      backgroundColor: 'rgba(0, 0, 255,0.5)',
    },
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [];

  //Tabel sorting items
  arrowUpNotSel = faChevronUp;
  arrowDownNotSel = faChevronDown;
  arrowUpSel = faChevronCircleUp;
  arrowDownSel = faChevronCircleDown;
  tableIcon = faTable;

  headersTable = [
    {
      name: "Country", up:this.arrowUpNotSel, down:this.arrowDownNotSel, comparator: this.CountryComp, class:"country"
    },
    {
      name: "New Cases", up:this.arrowUpNotSel, down:this.arrowDownNotSel, comparator: this.NCComp, class:"cases"
    },
    {
      name: "Total Cases", up:this.arrowUpNotSel, down:this.arrowDownNotSel, comparator: this.TCComp, class:"cases"
    },
    {
      name: "New Recoveries", up:this.arrowUpNotSel, down:this.arrowDownNotSel, comparator: this.NRComp, class:"recoveries"
    },
    {
      name: "Total Recoveries", up:this.arrowUpNotSel, down:this.arrowDownNotSel, comparator: this.TRComp, class:"recoveries"
    },
    {
      name: "New Deaths", up:this.arrowUpNotSel, down:this.arrowDownNotSel, comparator: this.NDComp, class:"deaths"
    },
    {
      name: "Total Deaths", up:this.arrowUpNotSel, down:this.arrowDownNotSel, comparator: this.TDComp, class:"deaths"
    }
  ]



  constructor(public DataService: DataService, private datepipe: DatePipe) { }

  ngOnInit(): void {

    this.DataService.getWorldData()
      .subscribe(data => {
        this.global_data = {
       new_cases: (data as any).Global.NewConfirmed,
       tot_cases: (data as any).Global.TotalConfirmed,
       new_deaths: (data as any).Global.NewDeaths,
       tot_deaths: (data as any).Global.TotalDeaths,
       new_recovered: (data as any).Global.NewRecovered,
       tot_recovered: (data as any).Global.TotalRecovered,
       active_cases: (data as any).Global.TotalConfirmed - (data as any).Global.TotalDeaths - (data as any).Global.TotalRecovered,
       recovery_rate: (data as any).Global.TotalRecovered/(data as any).Global.TotalConfirmed,
       death_rate: (data as any).Global.TotalDeaths/(data as any).Global.TotalConfirmed};

      this.pieChartData = [(data as any).Global.TotalConfirmed - (data as any).Global.TotalDeaths - (data as any).Global.TotalRecovered,
        (data as any).Global.TotalRecovered, (data as any).Global.TotalDeaths];

      this.countries=data["Countries"];
      
      this.userSignedIn = this.DataService.userSignedIn();
      //console.log(this.userSignedIn);
      this.user = this.DataService.getUser();
      
      if(this.userSignedIn){
        this.DataService.checkIfSuperUser();
      }

      //retrieve news to display them
      this.DataService.getNews()
      .subscribe((news: News[]) => {
        this.news = news;
        //console.log(this.news);
      })

      });
  
  //Bar chart
  var lastweek_new=[];
  var lastweek_rec=[];
  var lastweek_dead=[];
  var lastweek_dates=[];
  
  this.DataService.getTotLast7Days(0)
  .subscribe(data => {
    //console.log(data);
    /*
    CHANGED 'CAUSE API DID NOT WORK
    for (let i=0; i<7; i++){
      lastweek_new.push(data[i]['NewConfirmed']);
      lastweek_rec.push(data[i]['NewRecovered']);
      lastweek_dead.push(data[i]['NewDeaths']);
      let today = new Date();
      lastweek_dates.push(this.datepipe.transform(new Date().setDate(today.getDate()-7+i), "dd/MM")); 
    }*/
    //code for new API
    lastweek_new = Object.values(data["cases"]);
    lastweek_dead = Object.values(data["deaths"]);
    lastweek_rec = Object.values(data["recovered"]);
    lastweek_dates = Object.keys(data["cases"]);

    //dates in nicer formatting
    for(let i=0;i<lastweek_dates.length;i++){
      lastweek_dates[i] = this.datepipe.transform(lastweek_dates[i], 'dd/MM/yyyy');
    }

    var lastweek_new_incr=[];
    var lastweek_rec_incr=[];
    var lastweek_dead_incr=[];
  
    //compute daily data with diffference wrt previous day
    for (let i=1; i<8; i++){
      lastweek_new_incr[i-1] = lastweek_new[i]-lastweek_new[i-1];
      lastweek_rec_incr[i-1] = lastweek_rec[i]-lastweek_rec[i-1];
      lastweek_dead_incr[i-1] = lastweek_dead[i]-lastweek_dead[i-1];  
    }
    lastweek_dates.shift(); //remove first date (8th day - not displayed)

    this.barChartLabels = lastweek_dates;
    this.barChartData = [
      {data: lastweek_dead_incr, label: 'Daily Deaths'},
      {data: lastweek_rec_incr, label: 'Daily Recovered'},
      {data: lastweek_new_incr, label: 'Daily New Cases'}
    ];
  })

  //day1 line chart
  var day1_confirmed=[];
  var day1_deaths=[];
  var day1_recovered=[];
  var day1_dates=[];
  
  this.DataService.getDay1Data(0)
  .subscribe(data => {
    //console.log(data);
    let today = new Date();
     //PROBLEM! Original API does not work! Changed with another API 
     /*
    day1_confirmed.push(data[0]["NewConfirmed"]);
    day1_deaths.push(data[0]["NewDeaths"]);
    day1_recovered.push(data[0]["NewRecovered"]);
    let tot: number;
    for(let c=1; c<Object.keys(data).length; c++){
      day1_confirmed.push(data[c]["NewConfirmed"]+day1_confirmed[c-1]);
      day1_deaths.push(data[c]["NewDeaths"]+day1_deaths[c-1]);
      day1_recovered.push(data[c]["NewRecovered"]+day1_recovered[c-1]);
      day1_dates.push(this.datepipe.transform(new Date().setDate(today.getDate()-Object.keys(data).length+(c)), "dd/MM/yyyy"));
      tot=c+1;
    }
    day1_dates.push(this.datepipe.transform(new Date().setDate(today.getDate()-Object.keys(data).length+(tot)), "dd/MM/yyyy"));*/

    //adjusted for 2nd API
    day1_confirmed = Object.values(data["cases"]);
    day1_deaths = Object.values(data["deaths"]);
    day1_recovered = Object.values(data["recovered"]);
    day1_dates = Object.keys(data["cases"]);

    //dates in nicer formatting
    for(let i=0;i<day1_dates.length;i++){
      day1_dates[i] = this.datepipe.transform(day1_dates[i], 'dd/MM/yyyy');
    }

    //we have everything we need for the line chart
    this.lineChartLabels = day1_dates;
    this.lineChartData = [
      {data: day1_confirmed, label: 'Total Cases'},
      {data: day1_deaths, label: 'Total Deaths'},
      {data: day1_recovered, label: 'Total Recovered'}
    ];

  })
 
  }

  sortTable(elem: any, reversed: boolean){
    this.countries.sort(elem["comparator"]);

    for(let i in this.headersTable){
      this.headersTable[i]["up"] = this.arrowUpNotSel;
      this.headersTable[i]["down"] = this.arrowDownNotSel;
    }
    if(!reversed){
      elem["up"] = this.arrowUpNotSel;
      elem["down"] = this.arrowDownSel;
    } else {
      this.countries.reverse();
      elem["up"] = this.arrowUpSel;
      elem["down"] = this.arrowDownNotSel;
    }

  }

  CountryComp(countryA: any, countryB: any){
    return countryA.Country.localeCompare(countryB.Country);
  }

  NCComp(countryA: any, countryB: any){
    return countryA.NewConfirmed - countryB.NewConfirmed;
  }

  TCComp(countryA: any, countryB: any){
    return countryA.TotalConfirmed - countryB.TotalConfirmed;
  }

  NRComp(countryA: any, countryB: any){
    return countryA.NewRecovered - countryB.NewRecovered;
  }

  TRComp(countryA: any, countryB: any){
    return countryA.TotalRecovered - countryB.TotalRecovered;
  }

  NDComp(countryA: any, countryB: any){
    return countryA.NewDeaths- countryB.NewDeaths;
  }

  TDComp(countryA: any, countryB: any){
    return countryA.TotalDeaths - countryB.TotalDeaths;
  }



}
