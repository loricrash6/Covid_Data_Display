export class world_data{
    //message:string,
    //countries:object,
    //global:object,
    //date:string,

    //global:object

    new_cases: number;
    tot_cases: number;
    new_deaths: number;
    tot_deaths: number;
    new_recovered: number;
    tot_recovered: number;

    active_cases: number;
    recovery_rate: number;
    death_rate: number

    constructor(new_cases: number,tot_cases: number,new_deaths: number,tot_deaths: number,new_recovered: number,
        tot_recovered: number){
            this.new_cases = new_cases;
            this.tot_cases = tot_cases;
            this.new_deaths = new_deaths;
            this.tot_deaths = tot_deaths;
            this.new_recovered = new_recovered;
            this.tot_recovered = tot_recovered;
        }
}