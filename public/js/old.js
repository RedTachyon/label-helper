let N = 10;
let X = linspace(-Math.PI, Math.PI, 50);
let Y = X.map((x) =>  {
    return .2*x*x + Math.sin(2*x)
});

let newY = X.map((x) => {
    return .2*x*x + Math.cos(2*x);
});

let data = [];

for (let i = 0; i < X.length; i++) {
    data.push({
        x: X[i],
        y: Y[i],
        /*click: onClick*/})
}

let newData = [];

for (let i = 0; i < X.length; i++) {
    newData.push({
        x: X[i],
        y: newY[i]
    })
}

let oldData = data.slice();

console.log(data.length);