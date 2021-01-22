import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import {world_data} from '../world_data';
import { User } from '../user';
import { News } from '../news';

@Component({
  selector: 'app-add-news',
  templateUrl: './add-news.component.html',
  styleUrls: ['./add-news.component.css']
})
export class AddNewsComponent implements OnInit {

  date: any;
  description: string;
  country: string;
  user: User;
  countries: any;
  world: string; 

  constructor(public DataService: DataService) { }

  ngOnInit(): void {

    this.world = "Worldwide";

    this.user = this.DataService.getUser();

    this.DataService.getWorldData()
    .subscribe(data => {
      this.countries = data["Countries"];
      //console.log(this.countries);
    })
    
  }

  addNews(){
    let news: News = {
      date: new Date(),
      content: this.description,
      country: this.country,
      author: this.user
    };
    this.DataService.addNews(news);
    this.date = undefined;
    this.description = undefined;
    this.country = undefined;
    
  }

  

}
