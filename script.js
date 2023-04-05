// get api and stringifify it
function queryFetch(query) {
  return fetch("https://01.kood.tech/api/graphql-engine/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query: query
      })
  }).then(response => {
  return response.json();

})
}
// getting UserId and Username
window.addEventListener("load",function() {
  const nimi = document.getElementById('nimi')
  const id1 = document.getElementById('id1')
  
  
  queryFetch(`{
      user (where:{login: {_eq: "lauriraus"}}) {
        login
        id
      }
    }`).then(data => {
      //nimi.innerText = data.data.user.login
    data.data.user.forEach(asi=> {
      nimi.innerText = asi.login
      id1.innerText = asi.id
      
    });

  })
})

// getting info about audit ratio
window.addEventListener("load",function() {
  Promise.all([
        queryFetch(`{
    user(where: {login: {_eq: "lauriraus"}}) {
      transactions(
        limit: 100 
        where: {type: {_eq: "down"}, object: {type: {_nregex: "exercise|raid"}}}
      ) {
        amount
      }
    }
  }`),
  queryFetch(`{
    user(where: {login: {_eq: "lauriraus"}}) {
      transactions(
        limit: 100 
        where: {type: {_eq: "up"}, object: {type: {_nregex: "exercise|raid"}}}
      ) {
        amount
      }
    }
  }`)
  ])
  .then(results => {
    const downTransactionsLength = results[0].data.user[0].transactions.length;
    const upTransactionsLength = results[1].data.user[0].transactions.length;
    console.log(downTransactionsLength,upTransactionsLength )
console.log(results.data)
    // making a pie chart
    var data = {
  series: [downTransactionsLength, upTransactionsLength, ]
}
var sum = function(a, b) { return a + b };
new Chartist.Pie('.ct-chart1', data, {
  labelInterpolationFnc: function(value) {
    return Math.round(value / data.series.reduce(sum) * 100) + '%';
  },
});
  }) 
})

// getting the amount of ex per project and the date
window.addEventListener("load",function() {
  
  Promise.all([
    queryFetch(`{
      user(where: {login: {_eq: "lauriraus"}}) {
        transactions(
          limit: 50
          order_by: {amount: asc_nulls_first}
          where: {type: {_eq: "xp"}, object: {type: {_nregex: "exercise|raid"}}}
        ) {
          amount
          path
          createdAt
          object {
            name
            type
          }
        }
      }
    }`),
    queryFetch(`{
      user(where: {login: {_eq: "lauriraus"}}) {
        progresses(
          limit: 50
          where: {isDone: {_eq: true}, _or: [{object: {type: {_eq: "project"}}}, {object: {type: {_eq: "piscine"}}}]}
        ) {
          isDone
          path
          object {
            name
          }
        }
      }
    }`)
  ])
  .then(([transactionsData, progressesData]) => {
    const groupedTransactions = transactionsData.data.user[0].transactions.reduce((acc, transaction) => {
      if (!acc[transaction.path]) {
        acc[transaction.path] = {
          transactions: [],
          createdAts: []
        };
      }
      acc[transaction.path].transactions.push(transaction);
      acc[transaction.path].createdAts.push(transaction.createdAt);
      return acc;
    }, {});
    const matchingAmounts = Object.keys(groupedTransactions).reduce((acc, path) => {
      const highestAmountTransaction = groupedTransactions[path].transactions.reduce((highest, current) => {
        return current.amount > highest.amount ? current : highest;
      }, { amount: 0 });
      const highestAmountIndex = groupedTransactions[path].transactions.findIndex(transaction => transaction === highestAmountTransaction);
      const highestAmountCreatedAt = groupedTransactions[path].createdAts[highestAmountIndex];
      if (progressesData.data.user[0].progresses.some(progress => progress.path === path)) {
        const createdAtRegex = /\d+\W\d+\W\d+/;
        const createdAtMatch = highestAmountCreatedAt.match(createdAtRegex);
        if (createdAtMatch) {
          acc.push({
            amount: highestAmountTransaction.amount,
            createdAt: createdAtMatch[0]
          });
        }
      }
      return acc;
    }, []);
    matchingAmounts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    console.log(matchingAmounts);

// making a line chart 
    var chart = new Chartist.Line('.ct-chart', {
      labels: [1, 2, 3, 4, 55],
      series: [
        [12, 9, 7, 8, 5]
      ]
    });
    
    // Listening for draw events that get emitted by the Chartist chart
    chart.on('draw', function(data) {
      // If the draw event was triggered from drawing a point on the line chart
      if(data.type === 'point') {
        // We are creating a new path SVG element that draws a triangle around the point coordinates
        var triangle = new Chartist.Svg('path', {
          d: ['M',
            data.x,
            data.y - 15,
            'L',
            data.x - 15,
            data.y + 8,
            'L',
            data.x + 15,
            data.y + 8,
            'z'].join(' '),
          style: 'fill-opacity: 1'
        }, 'ct-area');
    
        // With data.element we get the Chartist SVG wrapper and we can replace the original point drawn by Chartist with our newly created triangle
        data.element.replace(triangle);
      }
    });
    
  })
  .catch(error => console.error(error));
//console.log(nii.amount)
})


// getting the current level
window.addEventListener("load",function() {
  const lev = document.getElementById('lvl')
  queryFetch(`{
    transaction(
      where: {userId: {_eq: 3875}, type: {_eq: "level"}, object: {type: {_nregex: "exercise|raid"}}}
      limit: 1
      offset: 0
      order_by: {amount: desc}
  )
  {
      amount
  }
  }
`).then(data => {
data.data.transaction.forEach(asi=> {
  lev.innerText = asi.amount
  
});
    console.log(data.data.transaction)
  })
})









