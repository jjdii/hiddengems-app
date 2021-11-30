import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  pullData(provider: string, options: any) {
    // const host = 'http://localhost:7071';
    const host = 'https://hiddengems-api.azurewebsites.net';
    return this.http.post(`${host}/api/Get${provider}Data`, {
      options
    }).toPromise();
  }

}
