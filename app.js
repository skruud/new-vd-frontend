//Event Listeners
document.addEventListener('DOMContentLoaded', getTableContent);
addSelectedButton.addEventListener('click', addSelected);
loadDataButton.addEventListener('click', loadData);
tableSelection.addEventListener('change', changeCategoryTable)
removeSelectionButton.addEventListener('click', removeSelection);
clearTableButton.addEventListener('click', clearTable);


function getData(inputData) {
    return fetch('https://ohipksnah8.execute-api.eu-north-1.amazonaws.com/dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputData),
    })
    .then(response => response.json())
    .then( function(data)  {
      return data;
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

tableDict = {
    "duration"  : "Ansettelsesform",
    "form"      : "Heltid/deltid",
    "industry"  : "Bransje",
    "occupation": "Stilling",
    "sector"    : "Sektor",
    "role"      : "Lederkategori"
}

tableContentJSON = {
    "body": [
        {
        "type": "unique",
        "select": "category",
        "from": "duration",
        "where": "location = 'Norge'",
        "order": "category"
        }, {
        "type": "unique",
        "select": "category",
        "from": "form",
        "where": "location = 'Norge'",
        "order": "category"
        }, {
        "type": "unique",
        "select": "category",
        "from": "industry",
        "where": "location = 'Norge'",
        "order": "category"
        }, {
        "type": "unique",
        "select": "category",
        "from": "occupation",
        "where": "location = 'Norge'",
        "order": "category"
        },
        {
        "type": "unique",
        "select": "category",
        "from": "sector",
        "where": "location = 'Norge'",
        "order": "category"
        }, {
        "type": "unique",
        "select": "category",
        "from": "role",
        "where": "location = 'Norge'",
        "order": "category"
        },
        {
        "type": "unique",
        "select": "location",
        "from": "duration",
        "where": "",
        "order": "location"
        }
    ]
}

async function loadData(event) {
    dataToSend = []

    function getKeyByValue(object, value) { 
        return Object.keys(object).find(key =>  
                object[key] === value); 
    }

    for (i = 0; i < selectedTable.options.length; i++)
    {
        currentData = selectedTable.options[i].text.split(" | ")
        console.log(currentData)
        selectedData = {
            "type": "normal",
            "select": "amount, date",
            "from": getKeyByValue(tableDict, currentData[2]),
            "where": "location = '" + currentData[1] + "'"+
                     " AND category = '" + currentData[0] + "'",
            "order": "date"
        }
        console.log(selectedData)
        dataToSend.push(selectedData)
    }
    
    jsonToSend = {
        "body": dataToSend
    }

    let dbReturn = await getData(jsonToSend)
    dbReturn = JSON.parse(dbReturn['body'])

    dataForChart = prepareDataForChart(dbReturn)

    insertToChart(dataForChart)

    
}

function prepareDataForChart(data) {
    dataForChart = []
    for (i = 0; i < data.length; i++)
    {
        currentDataset = []
        for (j = 0; j < data[i].length; j++)
        {
            point = {
                x : data[i][j][1],
                y : data[i][j][0]
            }
            currentDataset.push(point)
        }
        dataForChart.push(currentDataset)
    }
    return dataForChart
}

function insertToChart(data) {
    config.data.datasets = []
    var colorNames = Object.keys(window.chartColors);
    for (i = 0; i < dataForChart.length; i++)
    {
        var colorName = colorNames[config.data.datasets.length % colorNames.length];
		var newColor = window.chartColors[colorName];
        var newDataset = {
            label: selectedTable.options[i].text,
            borderColor: newColor,
            backgroundColor: color(newColor).alpha(0.5).rgbString(),
            fill: false,
            data: dataForChart[i],
        };
        config.data.datasets.push(newDataset);
    }
    window.myLine.update();
}

async function getTableContent(event) {
    event.preventDefault();
    let retur = await getData(tableContentJSON)
    outputArrays = JSON.parse(retur['body'])

    //console.log( tableContentJSON['body'][1]['from'] )
    for(n = 0; n < outputArrays.length; n++)
    {
        var currentTable = tableContentJSON['body'][n]['select']

        if (currentTable != "location")
        {
            var opt = document.createElement("option")
            opt.innerHTML = tableDict[ tableContentJSON['body'][n]['from'] ]
            //console.log(opt)
            tableSelection.appendChild(opt)
        }

        for (i = 0; i < outputArrays[n].length; i++)
        {
            var opt = document.createElement("option");
            opt.value= i;
            opt.innerHTML = outputArrays[n][i]; 

            // then append it to the select element
            if (currentTable == "location")
            {
                locationTable.appendChild(opt);
            } 
            
        }
    } 
    changeCategoryTable()
}

function addSelected(event) {
    if (categoryTable.selectedIndex === -1 ||
        locationTable.selectedIndex === -1) 
    {
        console.log('Invalid selection!')
    } else {
        var category = categoryTable.options[categoryTable.selectedIndex];
        var location = locationTable.options[locationTable.selectedIndex];
        var table = tableSelection.options[tableSelection.selectedIndex];

        var opt = document.createElement("option");
        //opt.value= i;
        opt.innerHTML = category.text+" | "+location.text+" | "+table.text; 

        selectedTable.appendChild(opt)
    }
    
    
}

function changeCategoryTable(event) {
    tableData = outputArrays[tableSelection.options.selectedIndex]
    console.log(categoryTable.options)
    while (categoryTable.hasChildNodes())
    {
        categoryTable.options.remove(0)
    }
    for (i = 0; i < tableData.length; i++)
    {
        var opt = document.createElement("option");
        //opt.value= i;
        opt.innerHTML = tableData[i]; 
        categoryTable.appendChild(opt);
    }
}

function removeSelection(event) {
    selectedTable.options.remove(selectedTable.options.selectedIndex)
}

function clearTable(event) {
    while (selectedTable.hasChildNodes())
    {
        selectedTable.options.remove(0)
    }
}