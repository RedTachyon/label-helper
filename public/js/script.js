/* global d3 */
'use strict';

function updateChart(chart, data1, data2) {
    chart.options.data[0].dataPoints = data1;
    chart.options.data[1].dataPoints = data2;

    $.get("/data", (res) => drawLines(chart, res));
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
        $.post('/data', {mode:mode, noiseStep:-1, thermometer, value:x.toFixed(2)}, (res) => drawLines(chart, res));
    } else if (mode === "noise") {
        $.post('/data',{mode:mode, noiseStep, thermometer, value:x.toFixed(2)}, (res) => drawLines(chart, res));
        noiseStep = (noiseStep + 1) % 2;
        document.getElementById("noiseStep").innerText = noiseStep ? "End" : "Start";
    }

}

function drawLines(chart, res) {
    let lines = res.split('\n');
    lines = lines.slice(0, lines.length-1);
    // noinspection JSCheckFunctionSignatures
    lines = lines.map(JSON.parse);

    lines = lines.map((elem) => {
        let color;
        if (elem.thermometer === "0" && elem.noiseStep === "-1") color = "#22D";
        if (elem.thermometer === "0" && elem.noiseStep === "0") color = "#88D";
        if (elem.thermometer === "0" && elem.noiseStep === "1") color = "#82A";

        if (elem.thermometer === "1" && elem.noiseStep === "-1") color = "#D22";
        if (elem.thermometer === "1" && elem.noiseStep === "0") color = "#D88";
        if (elem.thermometer === "1" && elem.noiseStep === "1") color = "#D82";

        return {value: elem.value, color: color, thickness: 2};
    });
    chart.options.axisX.stripLines = lines.filter((elem) => {
        let points = chart.options.data[0].dataPoints;
        let start = points[0].x;
        let end = points[points.length-1].x;
        return elem.value >= start && elem.value <= end;
    }); // filter
    chart.render();
    //console.log(chart.options.data[0].dataPoints[0].x);
    //console.log(chart.options.axisX.stripLines);
}

let mode = 'jump';
let thermometer = 0;
let noiseStep = 0;
let pointer;
let windowLength;
let windowStep;

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

        pointer = 0;
        windowLength = 1600;
        windowStep = 1500;

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
                    snapToDataPoint: true,
                    color: "blue",
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
                    color: "blue",
                },
                gridColor: "grey",
                gridThickness: .5,

            },
            data: [
                {
                    type: "line",
                    dataPoints: currentData1,
                    highlightEnabled: false,
                    visible: true,
                    color: '#33C',
                },
                {
                    type: "line",
                    dataPoints: currentData2,
                    highlightEnabled: false,
                    visible: true,
                    color: '#C33',
                }
            ]
        });

        chart.render();

        $.get("/data", (res) => drawLines(chart, res));

        /* BINDINGS */
        const canvas = document.getElementsByClassName("canvasjs-chart-canvas")[1];
        canvas.addEventListener("click", (event) => reactToClick(chart, event));

        // Switch window
        document.onkeydown = (event) => {
            //console.log(event.key);

            switch (event.key) {
                case "ArrowRight":
                    if (pointer + windowLength < allData1.length) {
                        pointer += windowStep;
                    }

                    updateChart(chart, allData1.slice(pointer, pointer + windowLength),
                        allData2.slice(pointer, pointer + windowLength));

                    document.getElementById("pointer").innerText = pointer.toString();
                    break;
                case "ArrowLeft":
                    if (pointer > 0) {
                        pointer = Math.max(pointer - windowStep, 0);
                        //pointer -= windowStep;
                    }

                    updateChart(chart, allData1.slice(pointer, pointer + windowLength),
                        allData2.slice(pointer, pointer + windowLength));
                    document.getElementById("pointer").innerText = pointer.toString();
                    break;
                case "u":
                    document.getElementById("undo").click();
                    break;
                case "m":
                    document.getElementById("mode").click();
                    break;
                case "j":
                    document.getElementById("switchNoise").click();
                    break;
                case "t":
                    document.getElementById("thermometer").click();
                    break;
                case "1":
                    document.getElementById("toggleBlue").click();
                    break;
                case "2":
                    document.getElementById("toggleRed").click();
                    break;
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

        document.getElementById("switchNoise").onclick = () => {
            noiseStep = (noiseStep + 1) % 2;
            document.getElementById("noiseStep").innerText = noiseStep ? "End" : "Start";
        };

        document.getElementById("sendLength").onclick = () => {
            let value = document.getElementById("windowLength").value;
            value = parseInt(value);
            windowLength = value;
            document.getElementById("lengthValue").innerText = windowLength;
        };

        document.getElementById("sendStep").onclick = () => {
            let value = document.getElementById("windowStep").value;
            value = parseInt(value);
            windowStep = value;
            document.getElementById("stepValue").innerText = windowStep;
        };

        document.getElementById("windowLength").onkeydown = (e) => {
            if (e.keyCode === 13) {
                document.getElementById("sendLength").click();
            }
            e.stopPropagation();
        };

        document.getElementById("windowStep").onkeydown = (e) => {
            if (e.keyCode === 13) {
                document.getElementById("sendStep").click();
            }
            e.stopPropagation();
        };

        document.getElementById("movePointer").onkeydown = (e) => {
            if (e.keyCode === 13) {
                document.getElementById("sendPointer").click();
            }
            e.stopPropagation();
        }

        document.getElementById("thermometer").onclick = () => {
            thermometer = (thermometer + 1) % 2;
            document.getElementById("activeTherm").innerText = thermometer ? "Red" : "Blue";
            let color = chart.options.axisX.crosshair.color;
            let newColor = (color === "blue") ? "red" : "blue";
            chart.options.axisX.crosshair.color = newColor;
            chart.options.axisY.crosshair.color = newColor;
            chart.render();
        };

        document.getElementById("toggleBlue").onclick = () => {
            chart.options.data[0].visible = !chart.options.data[0].visible;
            chart.render();
        };

        document.getElementById("toggleRed").onclick = () => {
            chart.options.data[1].visible = !chart.options.data[1].visible;
            chart.render();
        };

        document.getElementById("sendPointer").onclick = () => {
            pointer = parseInt(document.getElementById("movePointer").value);
            pointer = Math.max(pointer, 0);
            updateChart(chart, allData1.slice(pointer, pointer + windowLength),
                allData2.slice(pointer, pointer + windowLength));

            document.getElementById("pointer").innerText = pointer.toString();
        };

        document.getElementById("save").onclick = () => {
            $.post('/save', "save", () => "Saved");
        }

    });

};

/*
* zapisywać indeks punktu <- snap to datapoint, use built-in event handler? # meh
* Wyświetlać referencję; wektor czasu i temperatury w drugim pliku
* maybe: skok w górę, skok w dół
* zapisywanie backup
*
* IMMEDIATE TO DO:
*
*/

