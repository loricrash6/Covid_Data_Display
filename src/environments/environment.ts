// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig : {
    apiKey: "AIzaSyDQC5RRTvLpsALWFKCoAjTW6GVY32-2ufA",
    authDomain: "covid-cascioli.firebaseapp.com",
    databaseURL: "https://covid-cascioli.firebaseio.com",
    projectId: "covid-cascioli",
    storageBucket: "covid-cascioli.appspot.com",
    messagingSenderId: "55056371522",
    appId: "1:55056371522:web:123a9e407810c875ed82db"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
