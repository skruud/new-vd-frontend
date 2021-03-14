//Event Listeners
document.addEventListener('DOMContentLoaded', getTableContent);
addSelectedButton.addEventListener('click', addSelected);
loadDataButton.addEventListener('click', loadData);



console.log(newDateString(0))

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


jsonTest = {
    "body": [
        {
        "type": "unique",
        "select": "category",
        "from": "sector",
        "where": "location = 'Oslo'",
        "order": "category"
        },
        {
        "type": "normal",
        "select": "amount, date",
        "from": "occupation",
        "where": "location = 'Oslo' AND category = 'IT utvikling'",
        "order": "date"
        }
    ]
}

tableContentJSON = {
    "body": [
        {
        "type": "unique",
        "select": "category",
        "from": "occupation",
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
    for (i = 0; i < selectedTable.options.length; i++)
    {
        currentData = selectedTable.options[i].text.split(", ")
        console.log(currentData)
        selectedData = {
            "type": "normal",
            "select": "amount, date",
            "from": "occupation",
            "where": "location = '" + currentData[1] + "'"+
                     " AND category = '" + currentData[0] + "'",
            "order": "date"
        }
        dataToSend.push(selectedData)
    }
    
    jsonToSend = {
        "body": dataToSend
    }

    let dbReturn = await getData(jsonToSend)
    console.log( JSON.parse(dbReturn['body']) )
    dbReturn = JSON.parse(dbReturn['body'])



    dataForChart = []
    for (i = 0; i < dbReturn.length; i++)
    {
        currentDataset = []
        console.log(dbReturn[i])
        for (j = 0; j < dbReturn[i].length; j++)
        {
            point = {
                x : dbReturn[i][j][1],
                y : dbReturn[i][j][0]
            }
            currentDataset.push(point)
        }
        console.log(currentDataset)
        dataForChart.push(currentDataset)
    }
    console.log(dataForChart)

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
        var currentTable = tableContentJSON['body'][n]['from']
        for (i = 0; i < outputArrays[n].length; i++)
        {
            var opt = document.createElement("option");
            opt.value= i;
            opt.innerHTML = outputArrays[n][i]; 

            // then append it to the select element
            if (currentTable == "occupation")
            {
                occupationTable.appendChild(opt);
            } else
            {
                locationTable.appendChild(opt);
            }
            
        }
    } 
}

async function addSelected(event) {
    //event.preventDefault();
    var occupation = occupationTable.options[occupationTable.selectedIndex];
    var location = locationTable.options[locationTable.selectedIndex];

    var opt = document.createElement("option");
    //opt.value= i;
    opt.innerHTML = occupation.text+", "+location.text; 

    selectedTable.appendChild(opt)
    selectedData = {
        "type": "normal",
        "select": "amount, date",
        "from": "occupation",
        "where": "location = '"+location.text+"'"+
                 " AND category = '"+occupation.text+"'",
        "order": "date"
    }

    console.log(selectedTable.options)
    
}

data = [[{
    x: 10,
    y: 20
}, {
    x: 15,
    y: 10
}],
[{
    x: 20,
    y: 40
}, {
    x: 25,
    y: 20
}]]
console.log(data)

