/* global d3 */
'use strict';

function updateChart(chart, data1, data2) {
    chart.options.data[0].dataPoints = data1;
    chart.options.data[1].dataPoints = data2;

    chart.render();
}

function print(whatever) {
    console.log(whatever);
}

function reactToClick(chart, event) {
    let xPixel = event.clientX;
    let yPixel = event.clientY;

    let x = chart.axisX[0].convertPixelToValue(xPixel);
    let y = chart.axisY[0].convertPixelToValue(yPixel);
    console.log(x, y);
    // identify the point index

    if (mode === "jump") {
        $.post('/data', {mode:mode, noiseStep:-1, value:x}, (res) => drawLines(chart, res));
    } else if (mode === "noise") {
        $.post('/data',{mode:mode, noiseStep:noiseStep, value:x}, (res) => drawLines(chart, res));
        noiseStep = (noiseStep + 1) % 2;
        document.getElementById("noiseStep").innerText = noiseStep ? "End" : "Start";
    }

}

function drawLines(chart, res) {
    let lines = res.split('\n');
    lines = lines.slice(0, lines.length-1);
    // noinspection JSCheckFunctionSignatures
    lines = lines.map(JSON.parse);
    //console.log(lines);
    lines = lines.map((elem) => {
        return {value: elem.value, color: "#D22"};
    });
    chart.options.axisX.stripLines = lines;
    chart.render();
    console.log(chart.options.axisX.stripLines);
}

let mode = 'jump';
let noiseStep = 0;

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

        let currentData1 = allData1.slice(pointer, pointer + windowLength + 100);
        let currentData2 = allData2.slice(pointer, pointer + windowLength + 100);

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
                    snapToDataPoint: true,
                },
                gridColor: "grey",
                gridThickness: .5,
                stripLines:[],
            },
            axisY: {
                includeZero: false,
                crosshair: {
                    enabled: true,
                    snapToDataPoint: true,
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
        canvas.addEventListener("click", (event) => reactToClick(chart, event));

        // Switch window
        document.onkeydown = (event) => {
            //console.log(event.key);
            if (event.key === "ArrowRight") {

                if (pointer + windowLength < allData1.length) {
                    pointer += windowLength;
                }

                updateChart(chart, allData1.slice(pointer, pointer + windowLength + 100),
                    allData2.slice(pointer, pointer + windowLength + 100));

                document.getElementById("pointer").innerText = pointer.toString();
            } else if (event.key === "ArrowLeft") {
                if (pointer > 0) {
                    pointer -= windowLength;
                }

                updateChart(chart, allData1.slice(pointer, pointer + windowLength + 100),
                    allData2.slice(pointer, pointer + windowLength + 100));
                document.getElementById("pointer").innerText = pointer.toString();

            }
        };

        document.getElementById("mode").onclick = () => {
            if (mode === "jump") {
                mode = "noise";
                document.getElementById("noiseStep").innerText = noiseStep ? "End" : "Start";
            } else if (mode === "noise") {
                mode = "jump";
                document.getElementById("noiseStep").innerText = "None";
            } else {
                console.log("Wrong mode!")
            }

            document.getElementById("modename").innerText = mode;
        };

        document.getElementById("undo").onclick = () => {
          $.post("/undo", "boom", (res) => drawLines(chart, res));
        };

    });

};

/*
* pokazywać punkty #
* opcja pokazywania wcześniej zapisanych punktów #
* zapisywać indeks punktu <- snap to datapoint, use built-in event handler?
* zmienić format zapisu (w jednym pliku)? #
* zakładka (część punktów z poprzedniego/następnego okna) #
*/