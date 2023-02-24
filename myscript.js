var info;
n = new Date();
y = n.getFullYear();
m = n.getMonth() + 1;
d = n.getDate();
document.getElementById("date").innerHTML = m + "/" + d + "/" + y;

//Date check
document.getElementById('startDate').addEventListener("change", () => {
    var startDate = new Date(document.getElementById('startDate').value);
    startDate = new Date(startDate.setDate(startDate.getDate() + 1)).toISOString().slice(0, 10);
    document.getElementById('endDate').min = startDate;
})

document.getElementById('endDate').addEventListener("change", () => {
    var endDate = new Date(document.getElementById('endDate').value);
    endDate = new Date(endDate.setDate(endDate.getDate() - 1)).toISOString().slice(0, 10);
    document.getElementById('startDate').max = endDate;
})

document.getElementById('calculate').addEventListener("click", async () => {
    var endDate = document.getElementById('endDate').value;
    var startDate = document.getElementById('startDate').value;
    if (!startDate) { alert('Please fill the start date'); return }
    if (!endDate) { alert('Please fill the end date'); return }
    const data = await API(startDate, endDate)

    createTable(data);
    info = data;
    selectRowToInput();
})

async function API(startDate, endDate) {
    const dates = {
        startDate: startDate,
        endDate: endDate
    }
    const data = await fetch('https://faid.onrender.com/api', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dates)
    })
        .then(response => response.json())
    return data.data;
};

function createTable(tableData) {
    var table = document.getElementById('table');
    var tableBody = document.getElementById('tbody');
    var table_data = document.getElementById("table_data");


    tableData.forEach(function (rowData) {
        var row = document.createElement('tr');

        var pair_rank = document.createElement('td');
        pair_rank.appendChild(document.createTextNode(rowData.rank));
        row.appendChild(pair_rank);

        var Pair_1 = document.createElement('td');
        Pair_1.appendChild(document.createTextNode(rowData.pair1));
        row.appendChild(Pair_1);

        var pair_2 = document.createElement('td');
        pair_2.appendChild(document.createTextNode(rowData.pair2));
        row.appendChild(pair_2);

        var pro = document.createElement('td');
        pro.appendChild(document.createTextNode(rowData.profit));
        row.appendChild(pro);

        var cor = document.createElement('td');
        cor.appendChild(document.createTextNode(rowData.correlation));
        row.appendChild(cor);




        tableBody.appendChild(row);
    });
    document.getElementById("rankdiv").style.visibility = "visible";

    table.appendChild(tableBody);
    table_data.appendChild(table);
}


function selectRowToInput() {
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");

    for (var i = 0; i < rows.length; i++) {
        var currentRow = table.rows[i];
        currentRow.onclick = function () {

            rows = this.rowIndex - 1;
            PairDetail(rows)
            window.localStorage.setItem('index', rows)
        };
    }
}

function PairDetail(index) {

    var data = info[index];
    console.log(data)
    document.getElementById('pairname').innerHTML = data.pair1 + " & " + data.pair2;
    document.getElementById('netprofit').innerHTML = data.profit;
    document.getElementById('rank_val').innerHTML = data.rank;
    document.getElementById('correlation_val').innerHTML = data.correlation;
    plot(data.date, data.rsi1,data.rsi2, "line")
    document.getElementById("container2").style.visibility = "visible";
    document.getElementById('container2').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// PLOT
let myLineChart;
function plot(x_axis, data1,data2, graph) {
    if (myLineChart) myLineChart.destroy();
    let ctx = document.getElementById('myChart');

    myLineChart = new Chart(ctx, {
        type: graph,
        data: {
            labels: x_axis,
            datasets: [{
                label: "Stock A",
                data: data1,
                borderWidth: 1
            }, {
                label: 'Stock B',
                data: data2,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


