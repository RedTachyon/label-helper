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
        let color;
        switch (elem.noiseStep) {
            case "-1":
                color = "#22D";
                break;
            case "0":
                color = "#2D2";
                break;
            case "1":
                color = "#D22";
                break;
        }
        //console.log(color);
        return {value: elem.value, color: color};
    });
    chart.options.axisX.stripLines = lines.filter((elem) => {

    }); // filter
    chart.render();
    console.log(chart.options.axisX.stripLines);
}

let mode = 'jump';
let thermometer = 1;
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
                        pointer -= windowStep;
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
        };

        document.getElementById("windowStep").onkeydown = (e) => {
            if (e.keyCode === 13) {
                document.getElementById("sendStep").click();
            }
        };


    });

};

/*
* zapisywać indeks punktu <- snap to datapoint, use built-in event handler? # meh
* Wyświetlać referencję, wektor czasu i temperatury w drugim pliku
* większy wykres (w pionie) #
* flagi dla którego termometru jest zapis
* ukrywanie i pokazywanie danej linii
* zmiana szybkości przechodzenia
* powiększenie (!)
* maybe: skok w górę, skok w dół
* zapisywanie backup
* wydajność - nie wysyłać wszystkich linijek
* albo tylko nie pokazywać wszystkich linijek prostym filtrem
*/