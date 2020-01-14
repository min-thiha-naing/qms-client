// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // baseUrl: 'http://192.168.200.10:8080/api/',
  // rootUrl: 'http://192.168.200.10:8080/',
  baseUrl: 'http://192.168.1.5:8081',
  rootUrl: 'http://192.168.1.5:8081',
  // baseUrl: 'http://localhost:8081/',
  // rootUrl: 'http://localhost:8081/',
  oauth2ClientID: 'client',
  oauth2ClientPassword: 'Admin',
  // oauth2ClientID: 'easy-note-api-client-id',
  // oauth2ClientPassword: 'easy-note-api-client-password'

  terminalId: '3555',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
