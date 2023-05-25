//import  jwt_token, { handleToken } from './app.js';

//import { jwt_token } from "./app";

export function queryFetch(query, jwt_token) {
  return fetch("https://01.kood.tech/api/graphql-engine/v1/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      Authorization: `Bearer ${jwt_token}`
    },
    body: JSON.stringify({
      query: query
    })
  }).catch(error => console.error(error));
}
//getting UserId and Username
async function fetchUserData(jwt_token) {

  const token = jwt_token

  const tokenParts = token.split(".");

  const claims = JSON.parse(atob(tokenParts[1]));
  const sub = claims.sub;

  const nimi = document.getElementById('nimi');
  const id1 = document.getElementById('id1');

  try {
    const response = await queryFetch(`query {
      user (where: {id: {_eq: "${sub}"}}) {
        login
        id
      }
    }`, jwt_token);
    const data = await response.json();

    data.data.user.forEach(asi => {
      nimi.innerText = asi.login;
      id1.innerText = asi.id;
    });
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Check if there's a token in local storage
  const storedToken = localStorage.getItem('jwt_token');

  if (storedToken) {
   getAllData(storedToken)
  }
});
export async function getAllData(jwt_token) {
   await fetchUserData(jwt_token);
    await fetchUserData1(jwt_token);
    await fetchUserData2(jwt_token);
    await fetchUserData3(jwt_token)
}

// // getting the current level
async function fetchUserData1(jwt_token) {

  const token = jwt_token

  const tokenParts = token.split(".");

  const claims = JSON.parse(atob(tokenParts[1]));
  const sub = claims.sub;

  const lev = document.getElementById('lvl')
  try {
    const response = await queryFetch(`{
    transaction(
      where: {userId: {_eq: ${sub}}, type: {_eq: "level"}, object: {type: {_nregex: "exercise|raid"}}}
      limit: 1
      offset: 0
      order_by: {amount: desc}
  )
  {
      amount
  }
  }
`, jwt_token);
 const data = await response.json();

data.data.transaction.forEach(asi=> {
  lev.innerText = asi.amount
  
});
    //console.log(data.data.transaction)
  } catch (error) {
    console.error(error);
  }
}


//getting info about audit ratio

async function fetchUserData2(jwt_token) {

  const token = jwt_token

  const tokenParts = token.split(".");

  const claims = JSON.parse(atob(tokenParts[1]));
  const sub = claims.sub;

  try {
    const response1 = await queryFetch(`{
      user(where: {id: {_eq: "${sub}"}}) {
        transactions(
          limit: 200 
          where: {type: {_eq: "down"}, object: {type: {_nregex: "exercise|raid"}}}
        ) {
          amount
        }
      }
    }`, jwt_token);
    
    const response2 = await queryFetch(`{
      user(where: {id: {_eq: "${sub}"}}) {
        transactions(
          limit: 200 
          where: {type: {_eq: "up"}, object: {type: {_nregex: "exercise|raid"}}}
        ) {
          amount
        }
      }
    }`, jwt_token);
    
    const data1 = await response1.json();
    const data2 = await response2.json();
    
    const downTransactionsLength = data1.data.user[0].transactions.length;
    const upTransactionsLength = data2.data.user[0].transactions.length;
    //console.log(downTransactionsLength, upTransactionsLength);
    
    // making a pie chart
    var data = {
      series: [downTransactionsLength, upTransactionsLength]
    };
    //console.log(downTransactionsLength, upTransactionsLength);
    
    var sum = function(a, b) { return a + b };
    
    new Chartist.Pie('.ct-chart1', data, {
      labelInterpolationFnc: function(value) {
        return Math.round(value / data.series.reduce(sum) * 100) + '%';
      }
    });
  } catch (error) {
    console.error(error);
  }
}




// // getting the amount of ex per project and the date
async function fetchUserData3(jwt_token) {

  const totaal = document.getElementById('tot');

  const token = jwt_token

  const tokenParts = token.split(".");

  const claims = JSON.parse(atob(tokenParts[1]));
  const sub = claims.sub;
  
  try { 
    const response1 = await queryFetch(`{
    user(where: {id: {_eq: "${sub}"}}) {
      transactions(
        limit: 200
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
  }`, jwt_token);


  const response2 = await queryFetch(`{
    user(where: {id: {_eq: "${sub}"}}) {
      progresses(
        limit: 200
        where: {isDone: {_eq: true}, _or: [{object: {type: {_eq: "project"}}}, {object: {type: {_eq: "piscine"}}}]}
      ) {
        isDone
        path
        object {
          name
        }
      }
    }
  }`, jwt_token)

  const transactionsData = await response1.json();
  const progressesData = await response2.json();
    
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
    //console.log(matchingAmounts);

    const am = [];

    
    const da = [];

    matchingAmounts.forEach(item => {
      am.push(item.amount)
     
    })
    matchingAmounts.forEach(item => {
      da.push(item.createdAt)
     
    })

    let sum = 0;

    const dam = am;

    for (let i = 0; i < dam.length; i++) {
       sum += dam[i];
        dam[i] = sum;
  }

  let lastElement = am.slice(-1);

  totaal.innerText = lastElement

   // console.log(lastElement);
    //console.log(dam)


 //console.log(am)
 //console.log(da)

// making a line chart 
new Chartist.Line('.ct-chart', {
  labels: da,
  series: 
    [dam]
  
}, {
  low: 0,
  showArea: true
});
    
  } catch (error) {
    console.error(error);
  }
}












