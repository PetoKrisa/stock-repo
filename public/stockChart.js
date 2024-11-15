async function loadCharts(){
    //gatherData
    let userNames = []
    let portfolioCharts = document.getElementsByClassName("portfolio-chart")
    for(let chartElement of portfolioCharts){
        userNames.push({username: chartElement.dataset.username})
    }

    for(let user of userNames){
        let fetchData = await fetch(`/distribution/${user.username}`, {method: "get"})
        let fetchResponse = await fetchData.json()
        if(fetchResponse.status == "error"){
            alert(fetchResponse.message)
        }

        let userLabels = []
        let userData = []

        for(let data of fetchResponse){
            userLabels.push(data.stockName)
            userData.push(data.percentage)
        }
        user["labels"] = userLabels
        user["data"] = userData
    }
    console.log(userNames)

    //generate chart.js charts
    for(let user of userNames){
        let chartCtx = document.getElementById(`generated-${user.username}`)
        new Chart(chartCtx, {
            type: 'pie',
            data: {
              labels: user.labels,
              datasets: [{
                label: 'Share',
                data: user.data,
                borderWidth: 0
              }]
            },
            options: {
                legend: {
                    labels: {
                        fontColor: "white",
                        fontSize: 18
                    }
                },
            }
          });
    }
}
loadCharts()