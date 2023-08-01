import React, { useEffect, useState } from 'react'
import ApexCharts from 'apexcharts'
import { Component } from 'react';
import Chart from 'react-apexcharts'
import axios from 'axios';
import { Box } from '@mui/material'

class Donut extends Component {

    constructor(props) {
      super(props);
      this.state = {
        categoriesTotal: null,
        topCategories: null,
        countOfCategories: null,
        options: {},
        series: [44, 55, 41, 17, 15],
        labels: ['A', 'B', 'C', 'D', 'E']
      }
    }

    componentDidMount(){
        let data =  this.props.data
        let map = {}
        for (let i = 0; i < data.length; i++){
            let transaction = data[i]
            for (let i = 0; i < transaction.category.length; i++){
                let category = transaction.category[i]
                if (map[category] === undefined){
                    map[category] = 1
                } else {
                    map[category]++
                }
            }
        }
            
        let categoriesTotal = Object.values(map).reduce((sum, amount) => 
             sum += amount        
        ,0)
        let categories = Object.keys(map)
        let topCategories = Object.keys(map).map((category) => category = Math.ceil(map[category]/categoriesTotal * 100)).sort((a,b) => b = a)
        let options = {
                labels: [...categories],
                dataLabels: {
                    enabled: true,
                    formatter: function (val) {
                      return Math.ceil(val) + "%"
                    }
                  },
                  plotOptions: {
                    pie: {
                      donut: {
                        labels: {
                          show: true,
                          name: {
                            
                          },
                          value: {
                            formatter: function (val) {
                                return val + "%"
                              }
                        }
                        }
                      }
                    }
                  },
                  title: {
                    text: 'Spending by category breakdown',
                    align: 'left',
                    margin: 10,
                    offsetX: 0,
                    offsetY: 0,
                    floating: false,
                    style: {
                      fontSize:  '14px',
                      fontWeight:  'bold',
                      fontFamily:  undefined,
                      color:  '#263238'
                    },
                },
                theme: {
                    mode: 'light', 
                    palette: 'palette5', 
                    monochrome: {
                        enabled: false,
                        color: '#255aee',
                        shadeTo: 'light',
                        shadeIntensity: 0.65
                    },
                }
                
            }

        this.setState({
            series: topCategories,
            options: options
        })
    }


    render() {
      return (
        <div className="donut">
          <Chart 
            series={this.state.series} 
            options={this.state.options}
            type="donut" 
            width="100%"
            height="450" 
          />
        </div>
      );
    }
}

function SpendingChart() {
    const [data, setData] = useState([null])
    const [loading, setLoading] = useState(true)
    const authToken = window.localStorage.getItem('token')

    const getTransactions = React.useCallback(async () => {
        const response = await axios.get('/plaid/api/transactions', {
          headers: {
            authorization: authToken
          }
        })
        const data = await response.data
        setData(data)
        setLoading(false)
      }, [setData, setLoading]);

    useEffect(async ()=> {
        await getTransactions()
    }, [])

      return (
    <div>
        {
            //finished loading and have data? show the ch
             !loading && data != null && <Donut data={data}/>
        }
    </div>
  )
}

export default SpendingChart 
