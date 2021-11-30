import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Component } from '@angular/core';
// import { formatCurrency } from '@angular/common'
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  inputProvider = 'Coingecko'
  inputMaxPrice = '.000001'
  inputMinVolume = '100000'
  disableInput = false
  error = false
  coins: any
  results: any

  constructor(private appService: AppService) { }

  ngOnInit() {
    const localStorage_coingecko = localStorage.getItem('coingecko');
    if (localStorage_coingecko) {
      this.coins = JSON.parse(localStorage_coingecko)
      console.log(this.coins);
    }
  }

  async search(useCache: boolean) {
    this.results = undefined;

    try {
      this.disableInput = true
      let searchResponse: any;

      if (this.coins && useCache) {
        searchResponse = this.coins
        await new Promise((resolve: any, reject: any) => {
          try {
            setTimeout(function () {
              resolve(true)
            }, 750);
          } catch(error) {
            reject(error)
          }
        })
        this.results = searchResponse
      } else {
        this.coins = undefined
        searchResponse = await this.appService.pullData(this.inputProvider, {
          price_min: null,
          price_max: this.inputMaxPrice,
          volume_min: this.inputMinVolume,
          volume_max: null,
          filter: false,
          unique: true
        })
        if (searchResponse && searchResponse.message && searchResponse.error) {
          this.error = searchResponse.message
          this.results = undefined
        } else {
          this.results = searchResponse
          this.coins = searchResponse
          // localStorage.clear()
          localStorage.removeItem('coingecko')
          localStorage.setItem('coingecko', JSON.stringify(this.results))
        }
      }

      this.disableInput = false
      if (searchResponse && this.results) {
        
        // console.log(this.coins)
        this.results = this.results.filter((coin: any) => {
          return (coin.price <= this.inputMaxPrice && coin.volume >= this.inputMinVolume)
        })
        // console.log(this.coins)
        this.results = this.results.sort((a: any, b: any) => a.volume - b.volume )
        // console.log(this.coins)
        return true
      } else {
        return false
      }
    } catch (error) {
      this.disableInput = false
      throw error
    }
  }
}
