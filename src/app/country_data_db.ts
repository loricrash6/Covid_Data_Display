export class CountryDB{
    country: string;

    new_cases: number;
    tot_cases: number;
    new_deaths: number;
    tot_deaths: number;
    new_recovered: number;
    tot_recovered: number;
    last_updated: Date;

    constructor(country: string, new_cases: number,tot_cases: number,new_deaths: number,tot_deaths: number,new_recovered: number,
        tot_recovered: number, last_updated: Date){
            this.country = country;
            this.new_cases = new_cases;
            this.tot_cases = tot_cases;
            this.new_deaths = new_deaths;
            this.tot_deaths = tot_deaths;
            this.new_recovered = new_recovered;
            this.tot_recovered = tot_recovered;
            this.last_updated = last_updated;
        }
}