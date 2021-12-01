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
  inputMinPrice = 'Any'
  inputMaxPrice = '.000001'
  inputMinVolume = '100000'
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
      this.coins = JSON.parse(localStorage_coingecko)
      console.log('[CoinGecko] cached data:', this.coins);
      // this.results = this.coins
      await this.fetchData(true)

    }
  }

  async fetchData(useCache: boolean) {
    try {
      this.disableInput = true
      // let searchResponse: any;

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
    // console.log('this.inputMinPrice',this.inputMinPrice)
    // console.log('this.inputMaxPrice',this.inputMaxPrice)
    // console.log('this.inputMinVolume',this.inputMinVolume)
    // console.log('this.inputMaxVolume',this.inputMaxVolume)

    this.results = this.coins.filter((coin: any) => {
      return (
        coin.price >= Number((this.inputMinPrice == 'Any' ? 0 : this.inputMinPrice) || 0) &&
        coin.price <= Number((this.inputMaxPrice == 'Any' ? 10000000 : this.inputMaxPrice) || 10000000) &&
        coin.volume >= Number((this.inputMinVolume == 'Any' ? 0 : this.inputMinVolume) || 0) &&
        coin.volume <= Number((this.inputMaxVolume == 'Any' ? 1000000000000000 : this.inputMaxVolume) || 1000000000000000)
      )
    })
    // console.log(this.results)
    if (keywords) this.filterKeywordsData(true, true)
    // this.filterKeywordsData('inputInclude')
    // this.filterKeywordsData('inputExclude')
    if (sort) this.sortData()
  }

  filterIncludeKeywordsData(event: any) {
    console.log('this.inputInclude',this.inputInclude)
    console.log('event',event)

    this.filterData(false, false)

    // await new Promise((resolve: any, reject: any) => {
    //   try {
    //     setTimeout(function () {
    //       resolve(true)
    //     }, 100);
    //   } catch (error) {
    //     reject(error)
    //   }
    // })

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

    // this.filterExcludeKeywordsData(this.inputExclude)
    this.sortData()
  }

  filterExcludeKeywordsData(event: any) {
    console.log('this.inputExclude',this.inputExclude)
    console.log('event',event)

    this.filterData(false, false)

    // await new Promise((resolve: any, reject: any) => {
    //   try {
    //     setTimeout(function () {
    //       resolve(true)
    //     }, 100);
    //   } catch (error) {
    //     reject(error)
    //   }
    // })


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

    // this.filterIncludeKeywordsData(this.inputInclude)
    this.sortData()
  }

  filterKeywordsData(inputInclude: boolean, inputExclude: boolean) {
    // console.log('this.inputInclude',this.inputInclude)
    // console.log('this.inputExclude',this.inputExclude)
    // console.log('event',event)

    // await new Promise((resolve: any, reject: any) => {
    //   try {
    //     setTimeout(function () {
    //       resolve(true)
    //     }, 100);
    //   } catch (error) {
    //     reject(error)
    //   }
    // })

    if (inputInclude && this.inputInclude.length) {
      this.results = this.results.filter((coin: any) => {
        let includes = false;
        // this.inputInclude.split(' ').forEach((str) => {
          this.inputInclude.split(' ').forEach((str) => {
          includes = coin.name.includes(str)
        })
        return includes
      })
    }

    if (inputExclude && this.inputExclude.length) {
      this.results = this.results.filter((coin: any) => {
        let includes = false;
        // this.inputExclude.split(' ').forEach((str) => {
          this.inputExclude.split(' ').forEach((str) => {
          includes = coin.name.includes(str)
        })
        return !includes
      })
    }
    // console.log(this.results)
  }

  sortData() {
    // console.log('this.inputSortDirection',this.inputSortDirection)
    // console.log('this.inputSortBy',this.inputSortBy)

    if (this.inputSortDirection == 'asc') {
      this.results = this.results.sort((a: any, b: any) => a[this.inputSortBy] - b[this.inputSortBy])
    } else {
      this.results = this.results.sort((a: any, b: any) => b[this.inputSortBy] - a[this.inputSortBy])
    }
    // console.log(this.results)
  }

  refreshCache() {
    this.coins = undefined
    this.results = undefined

    localStorage.removeItem('coingecko')
  }

//   async search(useCache: boolean) {
//     this.results = undefined;

//     try {
//       this.disableInput = true
//       let searchResponse: any;

//       if (this.coins && useCache) {
//         searchResponse = this.coins
//         await new Promise((resolve: any, reject: any) => {
//           try {
//             setTimeout(function () {
//               resolve(true)
//             }, 750);
//           } catch (error) {
//             reject(error)
//           }
//         })
//         this.results = searchResponse
//       } else {
//         this.coins = undefined
//         searchResponse = await this.appService.pullData(this.inputProvider, {
//           price_min: this.inputMinPrice,
//           price_max: this.inputMaxPrice,
//           volume_min: this.inputMinVolume,
//           volume_max: this.inputMaxVolume,
//           filter: false,
//           unique: true
//         })
//         if (searchResponse && searchResponse.message && searchResponse.error) {
//           this.error = searchResponse.message
//           this.results = undefined
//         } else {
//           this.results = searchResponse
//           this.coins = searchResponse
//           // localStorage.clear()
//           localStorage.removeItem('coingecko')
//           localStorage.setItem('coingecko', JSON.stringify(this.results))
//         }
//       }

//       this.disableInput = false
//       if (searchResponse && this.results) {

//         // console.log(this.coins)
//         this.results = this.results.filter((coin: any) => {
//           return (
//             coin.price >= (this.inputMinPrice || 0) &&
//             coin.price <= (this.inputMaxPrice || 1000000) &&
//             coin.volume >= (this.inputMinVolume || 0) &&
//             coin.volume <= (this.inputMaxVolume || 1000000000000000)
//           )
//         })
//         // console.log(this.coins)
//         this.results = this.results.sort((a: any, b: any) => a.volume - b.volume)
//         // console.log(this.coins)
//         return true
//       } else {
//         return false
//       }
//     } catch (error) {
//       this.disableInput = false
//       throw error
//     }
//   }

}