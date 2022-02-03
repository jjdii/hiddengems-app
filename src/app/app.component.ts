import { Component } from '@angular/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  inputProvider = 'Coingecko'
  inputMinPrice = 'Any'
  inputMaxPrice = '.0001'
  inputMinVolume = '10000'
  inputMaxVolume = 'Any'
  inputInclude = ''
  inputExclude = 'Inu'
  inputSortBy = 'volume'
  inputSortDirection = 'asc'
  disableInput = false
  error = false
  coins: any
  results: any

  constructor(private appService: AppService) { }

  async ngOnInit() {
    const localStorage_coingecko = localStorage.getItem('coingecko');

    if (localStorage_coingecko) {
      var total = 0;
      for(var x in localStorage) {
        var amount = (localStorage[x].length * 2) / 1024 / 1024;
        total += amount;
        console.log( x + " = " + amount.toFixed(2) + " MB");
      }
      console.log( "Total: " + total.toFixed(2) + " MB");
      
      this.coins = JSON.parse(localStorage_coingecko)
      console.log('[CoinGecko] cached data:', this.coins);

      await this.fetchData(true)
    }
  }

  async fetchData(useCache: boolean) {
    try {
      this.disableInput = true

      if (this.coins && useCache) {
        await new Promise((resolve: any, reject: any) => {
          try {
            setTimeout(function () {
              resolve(true)
            }, 666);
          } catch (error) {
            reject(error)
          }
        })

      } else {
        this.coins = undefined

        const searchResponse: any = await this.appService.pullData(this.inputProvider, {
          filter: false,
          unique: true
        })
        if (searchResponse && searchResponse.message && searchResponse.error) {
          this.error = searchResponse.message
          this.results = undefined
        } else {
          this.coins = searchResponse

          localStorage.removeItem('coingecko')
          localStorage.setItem('coingecko', JSON.stringify(this.coins))
        }
      }

      this.results = this.coins
      if (this.results) {
        this.filterData(true, true)
      }

      this.disableInput = false
    } catch (error) {
      this.disableInput = false
      throw error
    }
  }

  filterData(keywords?: boolean, sort?: boolean) {
    this.results = this.coins.filter((coin: any) => {
      return (
        coin.price >= Number((this.inputMinPrice == 'Any' ? 0 : this.inputMinPrice) || 0) &&
        coin.price <= Number((this.inputMaxPrice == 'Any' ? 10000000 : this.inputMaxPrice) || 10000000) &&
        coin.volume >= Number((this.inputMinVolume == 'Any' ? 0 : this.inputMinVolume) || 0) &&
        coin.volume <= Number((this.inputMaxVolume == 'Any' ? 1000000000000000 : this.inputMaxVolume) || 1000000000000000)
      )
    })

    if (keywords) this.filterKeywordsData(true, true)

    if (sort) this.sortData()

    return true
  }

  filterKeywordsData(inputInclude: boolean, inputExclude: boolean) {
    if (inputInclude && this.inputInclude.length) {
      this.results = this.results.filter((coin: any) => {
        let includes = false;
          this.inputInclude.split(' ').forEach((str) => {
          includes = coin.name.includes(str)
        })
        return includes
      })
    }

    if (inputExclude && this.inputExclude.length) {
      this.results = this.results.filter((coin: any) => {
        let includes = false;
          this.inputExclude.split(' ').forEach((str) => {
          includes = coin.name.includes(str)
        })
        return !includes
      })
    }
  }

  sortData() {
    if (this.inputSortDirection == 'asc') {
      this.results = this.results.sort((a: any, b: any) => a[this.inputSortBy] - b[this.inputSortBy])
    } else {
      this.results = this.results.sort((a: any, b: any) => b[this.inputSortBy] - a[this.inputSortBy])
    }
  }

  filterIncludeKeywordsData(event: any) {
    console.log('this.inputInclude',this.inputInclude)
    console.log('event',event)

    this.filterData(false, false)

    if (event.length) {
      this.results = this.results.filter((coin: any) => {
        let includes = false;
        (event || '').split(' ').forEach((str) => {
          includes = coin.name.includes(str)
        })
        return includes
      })
    }

    this.filterKeywordsData(false, true)

    this.sortData()
  }

  filterExcludeKeywordsData(event: any) {
    console.log('this.inputExclude',this.inputExclude)
    console.log('event',event)

    this.filterData(false, false)

    if (event.length) {
      this.results = this.results.filter((coin: any) => {
        let includes = false;
        (event || '').split(' ').forEach((str) => {
          includes = coin.name.includes(str)
        })
        return !includes
      })
    }

    this.filterKeywordsData(true, false)

    this.sortData()
  }

  refreshCache() {
    this.coins = undefined
    this.results = undefined

    localStorage.removeItem('coingecko')
  }

}