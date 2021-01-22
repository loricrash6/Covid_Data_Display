import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import {world_data} from '../world_data';
import {CountryDB} from '../country_data_db';

import { ChartType, ChartOptions, ChartDataSets, controllers} from 'chart.js';
import { Label, Color} from 'ng2-charts';
import { Subscriber } from 'rxjs';
import {DatePipe} from '@angular/common';
import { User } from '../user';
import { News } from '../news';

import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {

  country_data: world_data;
  countries: any;
  country: string;
  slug: string;

  db_lastUpdate: any;

  userSignedIn: boolean;
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

  constructor(public DataService: DataService, private datepipe: DatePipe, private route:ActivatedRoute) {

    this.country = this.DataService.getCountry();

  }

  //ngOnInit(): void {
    async ngOnInit()  {

    if (this.country==undefined){
      this.country = this.route.snapshot.params['id'];
      this.DataService.country = this.country;
      
    }
    //console.log(this.country);
    this.userSignedIn = this.DataService.userSignedIn();
    this.user = this.DataService.getUser();
    
    if(this.userSignedIn){
      this.DataService.checkIfSuperUser();
    }
    //before asking country data to the API, check if we have 'em in Firestore
    var c = this.DataService.getCountry();

    //retrieve news to display them: ONLY THOSE OF THE COUNTRY OF INTEREST
    this.DataService.getNews()
    .subscribe((news: News[]) => {
      this.news = [];
      //console.log(news);
      for(let i=0; i<Object.keys(news).length; i++){
        if(news[i].country.toLowerCase() == c.toLowerCase()){
        //if(news[i].country == c){
          this.news.push(news[i]);
        }
      }
      //this.news = news;
      //console.log(this.news);
    })

    //need to pass from "Country" to "Slug" field for the country requests to the API!
    this.slug = await this.DataService.getSlugs();
    //console.log("Set slug to "+this.slug);
    
    console.log("Requesting Last Updated for "+c);
    console.log("If no further notice, data for Country Table are retrieved from Firestore storage.");

    this.DataService.getLastCountryUpdate(c)
    .subscribe((data) => 
      { 
        if(data){
        //there are already data on such country in our DB

        //console.log(data);
        this.db_lastUpdate = data["LastUpdated"].toDate()
        //var date_lastUpdate = this.datepipe.transform(new Date().setDate(this.db_lastUpdate.getDate()), "dd/MM/yyyy");
        this.db_lastUpdate.setHours(0,0,0,0);
        //console.log(date_lastUpdate);
        
        var today: any;
        today = new Date()
        today.setHours(0,0,0,0);

        //console.log(this.db_lastUpdate)
        //console.log(today)
        //now: if date is not today, we want to retrieve new data
        // otherwise, we simply load them from firestore
        if(this.db_lastUpdate.getTime() < today.getTime() ){
          //console.log("Need to fetch fresher data!!!");

          //fetch new data and add them into firestore
          this.DataService.getWorldData()
          .subscribe(data => {

            this.countries=data["Countries"];
            var country_index = this.DataService.findWithAttr(this.countries,"Country",this.country);

            this.country_data = {
              new_cases: (data as any).Countries[country_index].NewConfirmed,
              tot_cases: (data as any).Countries[country_index].TotalConfirmed,
              new_deaths: (data as any).Countries[country_index].NewDeaths,
              tot_deaths: (data as any).Countries[country_index].TotalDeaths,
              new_recovered: (data as any).Countries[country_index].NewRecovered,
              tot_recovered: (data as any).Countries[country_index].TotalRecovered,
              active_cases: (data as any).Countries[country_index].TotalConfirmed - (data as any).Countries[country_index].TotalDeaths - (data as any).Countries[country_index].TotalRecovered,
              recovery_rate: (data as any).Countries[country_index].TotalRecovered/(data as any).Countries[country_index].TotalConfirmed,
              death_rate: (data as any).Countries[country_index].TotalDeaths/(data as any).Countries[country_index].TotalConfirmed};

            this.pieChartData = [(data as any).Countries[country_index].TotalConfirmed - (data as any).Countries[country_index].TotalDeaths - (data as any).Countries[country_index].TotalRecovered,
                (data as any).Countries[country_index].TotalRecovered, (data as any).Countries[country_index].TotalDeaths];

            //push new data into firebase
            this.DataService.pushCountryData(this.country_data, c);

            console.log("Country already present in our DB, but old data: needed to re-fetch and update!");
          }
          ); 

        } else {
          //console.log("Same date, ok!");
          //simply use data which we just read 

          this.country_data = {
            new_cases: (data as any).NewConfirmed,
            tot_cases: (data as any).TotalConfirmed,
            new_deaths: (data as any).NewDeaths,
            tot_deaths: (data as any).TotalDeaths,
            new_recovered: (data as any).NewRecovered,
            tot_recovered: (data as any).TotalRecovered,
            active_cases: (data as any).TotalConfirmed - (data as any).TotalDeaths - (data as any).TotalRecovered,
            recovery_rate: (data as any).TotalRecovered/(data as any).TotalConfirmed,
            death_rate: (data as any).TotalDeaths/(data as any).TotalConfirmed};
          
          //console.log(this.country_data);
        }

        this.pieChartData = [(data as any).TotalConfirmed - (data as any).TotalDeaths - (data as any).TotalRecovered,
                (data as any).TotalRecovered, (data as any).TotalDeaths];
        //console.log("Didn't need to call the API, updated data already in our possess!");
        
      } else {
        //console.log("No data in DB for this country!");
        //no data for this country: request to API and create new document on firestore

        //push new data into firebase
        //this.DataService.pushCountryData(this.country_data, c);
        var today: any;
        today = new Date()
 
        //fetch new data and add them into firestore
        this.DataService.getWorldData()
        .subscribe(data => {
          //console.log(data);
          this.countries=data["Countries"];
          var country_index = this.DataService.findWithAttr(this.countries,"Country",this.country);

          this.country_data = {
            new_cases: (data as any).Countries[country_index].NewConfirmed,
            tot_cases: (data as any).Countries[country_index].TotalConfirmed,
            new_deaths: (data as any).Countries[country_index].NewDeaths,
            tot_deaths: (data as any).Countries[country_index].TotalDeaths,
            new_recovered: (data as any).Countries[country_index].NewRecovered,
            tot_recovered: (data as any).Countries[country_index].TotalRecovered,
            active_cases: (data as any).Countries[country_index].TotalConfirmed - (data as any).Countries[country_index].TotalDeaths - (data as any).Countries[country_index].TotalRecovered,
            recovery_rate: (data as any).Countries[country_index].TotalRecovered/(data as any).Countries[country_index].TotalConfirmed,
            death_rate: (data as any).Countries[country_index].TotalDeaths/(data as any).Countries[country_index].TotalConfirmed};

          this.pieChartData = [(data as any).Countries[country_index].TotalConfirmed - (data as any).Countries[country_index].TotalDeaths - (data as any).Countries[country_index].TotalRecovered,
              (data as any).Countries[country_index].TotalRecovered, (data as any).Countries[country_index].TotalDeaths];

          //push new data into firebase
          //console.log("Fetched data for new country, now pushing to db...");
          this.DataService.pushCountryData(this.country_data, c);

          console.log("No data were present for this country, hence we called the API and initialized it!");

          });
        }
      }
    );

  //Bar chart
  var lastweek_new=[];
  var lastweek_rec=[];
  var lastweek_dead=[];
  var lastweek_new_incr=[];
  var lastweek_rec_incr=[];
  var lastweek_dead_incr=[];
  var lastweek_dates=[];

  this.DataService.getTotLast7Days(1)
  .subscribe(data => {
    for (let i=0; i<8; i++){
      lastweek_new.push(data[i]['Confirmed']);
      lastweek_rec.push(data[i]['Recovered']);
      lastweek_dead.push(data[i]['Deaths']);
      let today = new Date();
      lastweek_dates.push(this.datepipe.transform(new Date().setDate(today.getDate()-7+i), "dd/MM/yyyy")); 
    }
    
    for (let i=1; i<lastweek_new.length;i++){
      lastweek_new_incr[i-1]=lastweek_new[i]-lastweek_new[i-1];
      lastweek_rec_incr[i-1]=lastweek_rec[i]-lastweek_rec[i-1];
      lastweek_dead_incr[i-1]=lastweek_dead[i]-lastweek_dead[i-1];
    }
    lastweek_new.shift();
    lastweek_rec.shift();
    lastweek_dead.shift();
    lastweek_dates.pop(); //today not useful, we stop at yesterday

    this.barChartLabels = lastweek_dates;
    this.barChartData = [
      {data: lastweek_dead_incr, label: 'Daily Deaths'},
      {data: lastweek_rec_incr, label: 'Daily Recovered'},
      {data: lastweek_new_incr, label: 'Daily New Cases'}
    ];
  })

  var day1_confirmed=[];
  var day1_deaths=[];
  var day1_recovered=[];
  var day1_dates=[];
  
  this.DataService.getDay1Data(1)
  .subscribe(data => {
    //console.log(Object.keys(data).length)

    //get to first available date for such country: used directly inside the following loop!
    let today = new Date();
    //let init = this.datepipe.transform(new Date().setDate(today.getDate()-Object.keys(data).length), "dd/MM/yyyy");
  
    for(let c=0; c<Object.keys(data).length; c++){
      day1_confirmed.push(data[c]["Confirmed"]);
      day1_deaths.push(data[c]["Deaths"]);
      day1_recovered.push(data[c]["Recovered"]);
      day1_dates.push(this.datepipe.transform(new Date().setDate(today.getDate()-Object.keys(data).length+c), "dd/MM/yyyy"));
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
}
