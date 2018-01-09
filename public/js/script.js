/* global d3 */
'use strict';

function updateChart(chart, data1, data2) {
    chart.options.data[0].dataPoints = data1;
    chart.options.data[1].dataPoints = data2;

    chart.render();
}

const saver = {
    id: 0, // ID of the window
    noises: [],//[[1.213, 2.131231], [2.5325, 3.7542]], // array of pairs of numbers
    jumps: [],//[3.1242, 4.31242] // array of numbers
};

let mode = 'jump';
let noiseStep = 0;
let noiseTemp = [];

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

            if (mode === "jump") {
                saver.jumps.push(x.toFixed(4));
            } else if (mode === "noise") {
                if (noiseStep === 0) {
                    noiseStep++;
                    noiseTemp.push(x.toFixed(4));
                    document.getElementById("noiseStep").innerText = "End";
                } else if (noiseStep === 1) {
                    noiseStep = 0;
                    noiseTemp.push(x.toFixed(4));
                    saver.noises.push(noiseTemp.slice());
                    noiseTemp = [];
                    document.getElementById("noiseStep").innerText = "Start";
                }
            }

        });

        document.onkeydown = (event) => {
            console.log(event.key);
            if (event.key === "ArrowRight") {

                if (saver.noises.length > 0 || saver.jumps.length > 0) sendData(saver);

                if (pointer + windowLength < allData1.length) {
                    pointer += windowLength;
                }

                saver.id = pointer;
                saver.jumps = [];
                saver.noises = [];

                updateChart(chart, allData1.slice(pointer, pointer + windowLength),
                    allData2.slice(pointer, pointer + windowLength));

                document.getElementById("pointer").innerText = pointer.toString();
            } else if (event.key === "ArrowLeft") {
                if (pointer > 0) {
                    pointer -= windowLength;
                }

                updateChart(chart, allData1.slice(pointer, pointer + windowLength),
                    allData2.slice(pointer, pointer + windowLength));
                document.getElementById("pointer").innerText = pointer.toString();

            }
        };

        document.getElementById("mode").onclick = () => {
            if (mode === "jump") {
                mode = "noise";
                document.getElementById("noiseStep").innerText = "Start";
            } else if (mode === "noise") {
                mode = "jump";
                document.getElementById("noiseStep").innerText = "None";
            } else {
                console.log("Wrong mode!")
            }
            document.getElementById("modename").innerText = mode;
        };

    });

};