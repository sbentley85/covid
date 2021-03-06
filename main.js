
const url1 ='https://api.covid19api.com/total/dayone/country/';
const url2 = ''

const input = document.querySelector('#input');




// Adds comma separators to retreived data
function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}


// Converts search term to title case for 'info' section
function titleCase(str) {
  
  if(str.length > 3) {
    str = str.toLowerCase().split(' '); 
    for (var i = 0; i < str.length; i++) { 
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);  
    } 
    return str.join(' '); 
  } else {
    return str.toUpperCase();
  }
  
} 


// renders response data to table
const renderTable = (res) => {
    // init caseList with Headings
    let caseList = [`<table class="highlight centered responsive-table"><thead><tr><th>Date</th><th>Confirmed</th><th>New Cases</th><th>Deaths</th><th>New Deaths</th><th>Recovered</th><th>Active</th></tr></thead><tbody>`]
    const resultsDiv = document.querySelector('#results');
    
    
    const newDate = res[0].Date.split('T')[0]
    caseList.push(`<tr><td>${newDate}</td>
    <td>${addCommas(res[0].Confirmed)}</td>
    <td>0</td>
    <td>${addCommas(res[0].Deaths)}</td>
    <td>0</td>
    <td>${addCommas(res[0].Recovered)}</td>
    <td>${addCommas(res[0].Active)}</td>
    </tr>`)
    
    for (var i = 1; i < (res.length); i ++) {
      // iterate through results & add html to caseList
      // format date
        const newDate = res[i].Date.split('T')[0]
        
        if(res[i].Deaths == 0) {
          // while there are no deaths we don't need to calculate change in deaths
          caseList.push(`<tr><td>${newDate}</td>
          <td>${addCommas(res[i].Confirmed)}</td>
          <td>${addCommas(res[i].Confirmed-res[i-1].Confirmed)}</td>
          <td>${addCommas(res[i].Deaths)}</td>
          <td>0</td>
          <td>${addCommas(res[i].Recovered)}</td>
          <td>${addCommas(res[i].Active)}</td>
          </tr>`)  
        } else {
          // if there have been previous deaths then calculate change
          caseList.push(`<tr><td>${newDate}</td>
          <td>${addCommas(res[i].Confirmed)}</td>
          <td>${addCommas(res[i].Confirmed-res[i-1].Confirmed)}</td>
          <td>${addCommas(res[i].Deaths)}</td>
          <td>${addCommas(res[i].Deaths-res[i-1].Deaths)}</td>
          <td>${addCommas(res[i].Recovered)}</td>
          <td>${addCommas(res[i].Active)}</td>
          </tr>`)
        }
        
    };

    caseList.push('</tbody></table>');
    caseList = caseList.join('');
    
    resultsDiv.innerHTML = caseList;
    


}


//renders response data into graph
const renderGraph = (res) => {
  // removes any previous chart data to avoid any conflicts on mouseover  
  document.getElementById('myChart').remove();
  document.getElementById('graph').innerHTML = '<canvas id="myChart" width="800px" height="400px"></canvas>';
  var ctx = document.getElementById('myChart');  


  // creates graph data from response
  const labels = []
  const confirmed = [];
  const deaths = [];
  const active = [];
  
  for (let i = 0; i < res.length; i++) {
    const newDate = moment(res[i].Date)
    
    labels.push(newDate)
    confirmed.push(res[i].Confirmed)
    deaths.push(res[i].Deaths)
    active.push(res[i].Active)
  }
  const datasets = [
    {
      label: 'Confirmed cases',
      backgroundColor: 'rgb(94, 135, 229)',
      fill: false,
      borderColor: 'rgb(94, 135, 229)',
      pointBackgroundColor: 'transparent',
      pointBorderColor: 'transparent',
      pointHoverBackgroundColor: 'rgb(94, 135, 229)',
      data: confirmed
    },
    {
      label: 'Deaths',
      backgroundColor: 'rgb(255, 99, 132)',
      fill: false,
      borderColor: 'rgb(255, 99, 132)',
      pointBackgroundColor: 'transparent',
      pointBorderColor: 'transparent',
      pointHoverBackgroundColor: 'rgb(255, 99, 132)',
      data: deaths
    },
    {
      label: 'Active Cases',
      backgroundColor: 'rgb(49, 216, 144)',
      fill: false,
      borderColor: 'rgb(49, 216, 144)',
      pointBackgroundColor: 'transparent',
      pointBorderColor: 'transparent',
      pointHoverBackgroundColor: 'rgb(49, 216, 144)',
      data: active
    }
  ];

  // sets relevant chart options based on selected radio button
  const chartType = document.getElementById('linear').checked ? 'linear' : 'logarithmic';
  const chartOption = (chartType === 'linear') ? {
    responsive: true,
    scales: {
      xAxes: [{
        type: 'time',
        time: {
          unit: 'month'
        }
      }]
    }
    
    
  } : {
    responsive: true,
    scales: {
      xAxes: [{
        type: 'time',
        time: {
          unit: 'month'
        }
      }],
      yAxes: [{
        type: 'logarithmic',
        ticks: {
          min: 0,
          max: 10000000,
          callback: function (value, index, values) {
              if (value === 10000000) return "10M";
              if (value === 1000000) return "1M";
              if (value === 100000) return "100K";
              if (value === 10000) return "10K";
              if (value === 1000) return "1K";
              if (value === 100) return "100";
              if (value === 10) return "10";
              if (value === 0) return "0";
              return null;
          }
        }
      }]
    }
    
    
  } 
    
  

  //creates chart
  var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: chartOption
  });

  // shows radio buttons
  document.querySelector("#radio").style.display = "block";
  
}
// Adds summary data to card
const renderCard = (res) => {
  const totalCasesSpan = document.querySelector('#total-cases');
  const activeCasesSpan = document.querySelector('#active-cases');
  const deathsSpan = document.querySelector('#deaths');
  const cardTitle = document.querySelector('#card-title');

  totalCasesSpan.innerHTML = addCommas(res[res.length-1].Confirmed);
  activeCasesSpan.innerHTML = addCommas(res[res.length-1].Active);
  deathsSpan.innerHTML = addCommas(res[res.length-1].Deaths);
  cardTitle.innerHTML = `<h6> Current Totals for ${titleCase(input.value)}<h6>`;
  document.querySelector('#card').style.display = 'block'
}


// sends http request on submit
const getCountry = async () => {
    const urlToFetch = `${url1}${input.value}${url2}`;
    
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      }; 
    try {
      const response = await fetch(urlToFetch, requestOptions)
      if (response.ok) {
        const jsonResponse = await response.json();
        
        await renderGraph(jsonResponse);
        await renderTable(jsonResponse);
        await renderCard(jsonResponse);
        await getWorldwide();
        localStorage.setItem('data', JSON.stringify(jsonResponse))
      }
    } catch (error) {
      console.log(error)
    }
  };


// Gets global data
const getWorldwide = async () => {
  const urlToFetch = `https://api.covid19api.com/summary`;
    
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      }; 
    try {
      const response = await fetch(urlToFetch, requestOptions)
      if (response.ok) {
        const jsonResponse = await response.json();
        sessionStorage.setItem('globalData', JSON.stringify(jsonResponse));
        
        renderGlobalCard();
      }
    } catch (error) {
      console.log(error);
    }

};

const renderGlobalCard = () => {
  const totalCasesGlobalSpan = document.querySelector('#total-cases-global');
  const activeCasesGlobalSpan = document.querySelector('#active-cases-global');
  const deathsGlobalSpan = document.querySelector('#deaths-global');
  const globalData = JSON.parse(sessionStorage.getItem('globalData'));
  totalCasesGlobalSpan.innerHTML = addCommas(globalData.Global.TotalConfirmed);
  activeCasesGlobalSpan.innerHTML = addCommas(globalData.Global.TotalConfirmed - globalData.Global.TotalRecovered);
  deathsGlobalSpan.innerHTML = addCommas(globalData.Global.TotalDeaths);
}

const search = async () => {
  if (!sessionStorage.globalData) {
    await getWorldwide();
  }

  await getCountry();
}

// Add search listener
const submit = document.querySelector('#search-button');
submit.addEventListener('click', search);

// Listen for chages to linear/logarithmic radio buttons & re-render graph
const radios = document.forms['formA'].elements['chart-type'];

for (let i = 0; i < radios.length; i++) {
  radios[i].onclick = () => {
    renderGraph(JSON.parse(localStorage.getItem('data')));
  }
}





