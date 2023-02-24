// const xlsxj = require("xlsx-to-json");
// // const calculateCorrelation = require("calculate-correlation");
const indicators = require('technicalindicators');

const express = require("express");
const router = express.Router();

router.post("/api", async (req, res) => {
    const body = req.body;
    console.log(body)
    var data = main(body);
    res.status(200).json({
        msg:'Success',
        data:data
    });
})

// xlsxj({
//     input: "Stock.xlsx",
//     output: "Stock.json",
//     sheet: "Sheet1",
// }, function (err, result) {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log("Stocks data converted to JSON");
//     }
// });
// xlsxj({
//     input: "Commodities.xlsx",
//     output: "Commodities.json",
//     sheet: "Sheet1",
// }, function (err, result) {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log("Commodities data converted to JSON");
//     }
// });
class Pair {
    constructor(pair1, pair2, closingPrice1, closingPrice2, date, correlation, rsi1, rsi2, macd1, macd2, profit) {
        this.pair1 = pair1;
        this.pair2 = pair2;
        this.profit = profit;
        this.correlation = correlation;
        this.closingPrice1 = closingPrice1;
        this.closingPrice2 = closingPrice2;
        this.rsi1 = rsi1;
        this.rsi2 = rsi2;
        this.macd1 = macd1;
        this.macd2 = macd2;
        this.date = date;
    }
    
}
function main(date){
    var dt = new Date(date.startDate);
    var dt2 = new Date(date.endDate);
    console.log(date.startDate,date.endDate);
const Stocks = require('./Stock.json')
const Commodities = require('./Commodities.json')
const FilterPair = [];
//Stocks
let i = 0;
while (i < 50) {
    let j = i + 1;
    while (j < 50) {

        let pair1 = Stocks.filter((a) => { if (a.Symbol == Stocks[i].Symbol) return a.CLOSE; });
        let pair2 = Stocks.filter((a) => { if (a.Symbol == Stocks[j].Symbol) return a.CLOSE; });

        let closingPrice1 = pair1.map(a => parseInt(a.CLOSE));
        let closingPrice2 = pair2.map(a => parseInt(a.CLOSE));
        let date1 = pair1.map(a => new Date(Date.parse(a.DATE)).toLocaleDateString());

        let n = closingPrice2.length;
        let correlation = correlationCoefficient(closingPrice1, closingPrice2, n);


        
        //Filter Pair
        if (correlation >= 0.7) {
            const inputRSI1 = {
                values: closingPrice1,
                period: 14
            };
            const rsi1 = indicators.RSI.calculate(inputRSI1);
            const inputRSI2 = {
                values: closingPrice2,
                period: 14
            };
            const rsi2 = indicators.RSI.calculate(inputRSI2);

            const macdInput1 = {
                values            : closingPrice1,
                fastPeriod        : 26,
                slowPeriod        : 12,
                signalPeriod      : 9,
                SimpleMAOscillator: false,
                SimpleMASignal    : false
            }
            const macd1 = indicators.MACD.calculate(macdInput1);
            const macdInput2 = {
                values            : closingPrice2,
                fastPeriod        : 12,
                slowPeriod        : 26,
                signalPeriod      : 9,
                SimpleMAOscillator: false,
                SimpleMASignal    : false
            }
            const macd2 = indicators.MACD.calculate(macdInput2);
            
            
            
            var datearr = date1;
            
            // console.log("datedt",dt.toDateString());
            let indexe; let indexs;
            
            for(let i =0; i<datearr.length; i++){
                
                
                if(new Date(datearr[i])==dt2){ 
                    indexe= i; break;
                }
                else if(new Date(datearr[i])<dt2){ indexe= i-1; break}
            
                
            }
            for(let i =0; i<datearr.length; i++){
                
            
            
                if(new Date(datearr[i])<=dt){indexs= i;break;}
            }
            
            
            let profit = netProfit(rsi1, rsi2, closingPrice1, closingPrice2, 0, 160);
            // console.log(profit, pair1[0].Symbol, pair2[0].Symbol);
            const pairdata = new Pair(pair1[0].Symbol, pair2[0].Symbol, closingPrice1, closingPrice2, date1, correlation, rsi1, rsi2, macd1, macd2, profit);
            FilterPair.push(pairdata);
            // break
        }
        
        j++;
    }
    // break
    i++;
}
FilterPair.sort((a, b) => b.profit - a.profit)
FilterPair.forEach((x, i) => x.rank = i+1);
FilterPair.forEach((x,i)=> x.correlation = parseFloat(x.correlation).toFixed(3))
return FilterPair;
}
// FilterPair.forEach((x, i) => console.log(x.rank,") ",x.profit, x.pair1, x.pair2, x.correlation));

function correlationCoefficient(X, Y, n) {

    let sum_X = 0, sum_Y = 0, sum_XY = 0;
    let squareSum_X = 0, squareSum_Y = 0;

    for (let i = 0; i < n; i++) {

        // Sum of elements of array X.
        sum_X = sum_X + X[i];

        // Sum of elements of array Y.
        sum_Y = sum_Y + Y[i];

        // Sum of X[i] * Y[i].
        sum_XY = sum_XY + X[i] * Y[i];

        // Sum of square of array elements.
        squareSum_X = squareSum_X + X[i] * X[i];
        squareSum_Y = squareSum_Y + Y[i] * Y[i];
    }

    // Use formula for calculating correlation
    // coefficient.
    let corr = (n * sum_XY - sum_X * sum_Y) /
        (Math.sqrt((n * squareSum_X -
            sum_X * sum_X) *
            (n * squareSum_Y -
                sum_Y * sum_Y)));

    return corr;
}
 
function netProfit(rsi1, rsi2, closingPrice1, closingPrice2, i, n){

    let profit=0;
    while(i<n)
    {
        //1st one in dip
        if(rsi1[i]<=30&&rsi2[i]>30)
        {
            //if paesa of first is min in the given loop
            let min=closingPrice1[i];
            let mini=i;
            while(i<n && rsi1[i]<=30 && rsi2[i]>30)
            {
                if(closingPrice1[i]<min)
                {
                    min=closingPrice1[i];
                    mini=i;
                }
                i++;
            }
            //here mini will be starting point of trading
            i=mini+1;
            //start trading
            let sell=closingPrice2[mini];
            let purchase=closingPrice1[mini];
            let max=0;
            
            while(i<n && (sell-closingPrice2[i]+closingPrice1[i]-purchase >= max))
            {
                max=sell-closingPrice2[i]+closingPrice1[i]-purchase ;
                i++;
            }
            profit+=max;
        }
        else if(rsi2[i]<=30&&rsi1[i]>30)
        {
            //if paesa of first is min in the given loop
            let min=closingPrice2[i];
            let mini=i;
            while(i<n && rsi2[i]<=30 && rsi1[i]>30)
            {
                if(closingPrice2[i]<min)
                {
                    min=closingPrice2[i];
                    mini=i;
                }
                i++;
            }
            //here mini will be starting point of trading
            i=mini+1;
            //start trading
            let sell=closingPrice1[mini];
            let purchase=closingPrice2[mini];
            let max=0;
            
            while(i<n && (sell-closingPrice1[i]+closingPrice2[i]-purchase >= max))
            {
                max=sell-closingPrice1[i]+closingPrice2[i]-purchase ;
                i++;
            }
            profit+=max;
        }
        else if(rsi1[i]>=70 && rsi2[i]<70)
        {
            //if paesa of first is min in the given loop
            let maxval=closingPrice1[i];
            let maxi=i;
            while(i<n && rsi1[i]>=70 && rsi2[i]<70)
            {
                if(closingPrice1[i]>maxval)
                {
                    maxval=closingPrice1[i];
                    maxi=i;
                }
                i++;
            }
            //here mini will be starting point of trading
            i=maxi+1;
            //start trading
            let sell=closingPrice1[maxi];
            let purchase=closingPrice2[maxi];
            let max=0;
            
            while(i<n && (sell-closingPrice1[i]+closingPrice2[i]-purchase >= max))
            {
                max=sell-closingPrice1[i]+closingPrice2[i]-purchase ;
                i++;
            }
            profit+=max;
        }
        else if(rsi2[i]>=70 && rsi1[i]<70)
        {
            //if paesa of first is min in the given loop
            let maxval=closingPrice2[i];
            let maxi=i;
            while(i<n && rsi2[i]>=70 && rsi1[i]<70)
            {
                if(closingPrice2[i]>maxval)
                {
                    maxval=closingPrice2[i];
                    maxi=i;
                }
                i++;
            }
            //here mini will be starting point of trading
            i=maxi+1;
            //start trading
            let sell=closingPrice2[maxi];
            let purchase=closingPrice1[maxi];
            let max=0;
            
            while(i<n && (sell-closingPrice2[i]+closingPrice1[i]-purchase >= max))
            {
                max=sell-closingPrice2[i]+closingPrice1[i]-purchase;
                i++;
            }
            profit+=max;
        }
        else i++;
        
    }

    return profit;
}

   // let max = Number.MIN_SAFE_INTEGER;
    // let min = Number.MAX_SAFE_INTEGER;

module.exports = router;