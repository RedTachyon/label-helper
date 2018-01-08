/* global d3 */
'use strict';

window.onload = function () {
    d3.csv('data/Tdata.csv', (data) => {
        let allData1 = data.map((point) => {
            return {
                x: parseFloat(point.time),
                y: parseFloat(point.T1),
            };
        });

        let allData2 = data.map((point) => {
            return {
                x: parseFloat(point.time),
                y: parseFloat(point.T2),
            };
        });

        let pointer = 0;
        let windowLength = 1500;

        let currentData1 = allData1.slice(pointer, pointer + windowLength);
        let currentData2 = allData2.slice(pointer, pointer + windowLength);

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
        chart.render();

        /* BINDINGS */
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
                if (pointer + windowLength < allData1.length) {
                    pointer += windowLength;
                }

                chart.options.data[0].dataPoints = allData1.slice(pointer, pointer + windowLength);
                chart.options.data[1].dataPoints = allData2.slice(pointer, pointer + windowLength);

                chart.render();
            } else if (event.key === "ArrowLeft") {
                if (pointer > 0) {
                    pointer -= windowLength;
                }

                chart.options.data[0].dataPoints = allData1.slice(pointer, pointer + windowLength);
                chart.options.data[1].dataPoints = allData2.slice(pointer, pointer + windowLength);

                chart.render();
            }
        };

        document.getElementById("test").onclick = () => {
            sendData({a: "thing"});
        }

    });

};