/* global d3 */
'use strict';

function linspace(min, max, num) {
    return _.range(min, max, (max - min) / num);
}

function updateWith(array, newArray) {
    for (let i = 0; i <= array.length; i++) {
        array[i] = newArray[i];
    }
}

window.onload = function () {

    d3.csv('data/Tdata.csv', (data) => {
        let allData1 = data.map((point) => {
            return {
                x: parseFloat(point.time),
                y: parseFloat(point.T1),
                //T2: parseFloat(point.T2)
            }
        });

        let allData2 = data.map((point) => {
            return {
                x: parseFloat(point.time),
                y: parseFloat(point.T2),
            }
        });
        console.log(allData1);

        let currentData1 = allData1.slice(108500, 110000);
        let currentData2 = allData2.slice(108500, 110000);
        console.log(currentData1[0].x);

        const chart = new CanvasJS.Chart("chartContainer", {
            //animationEnabled: true,
            //zoomEnabled: true,
            theme: 'light1',
            title: {
                text: "ACTOS data"
            },
            axisX: {
                includeZero: false,
                crosshair: {
                    enabled: true,
                    snapToDataPoint: false,
                },
                gridColor: "grey",
                gridThickness: .5,
            },
            axisY: {
                includeZero: false,
                crosshair: {
                    enabled: true,
                    snapToDataPoint: false,
                },
                gridColor: "grey",
                gridThickness: .5,
            },
            data: [
                {
                    type: "line",
                    dataPoints: currentData1,
                    highlightEnabled: false,
                },
                {
                    type: "line",
                    dataPoints: currentData2,
                    highlightEnabled: false,
                }
            ]
        });
        console.log('hi');

        chart.render();

        const canvas = document.getElementsByClassName("canvasjs-chart-canvas")[1];
        canvas.addEventListener("click", (event) => {
            let xPixel = event.clientX;
            let yPixel = event.clientY;

            let x = chart.axisX[0].convertPixelToValue(xPixel);
            let y = chart.axisY[0].convertPixelToValue(yPixel);
            console.log(x, y);

        });

        document.onkeydown = (event) => {
            console.log(event.key);
            if (event.key === "ArrowRight") {
                for (let i = 0; i < data.length; i++) {
                }
                chart.render();
            } else if (event.key === "ArrowLeft") {
                for (let i = 0; i < data.length; i++) {
                }

                chart.render();
            }
        };

    });

};