import fetch from 'node-fetch';
const BASE_URL = 'https://hm-api.cloud.tanium.com/plugin/products/gateway/graphql';
const TANIUM_TOKEN = process.env.TANIUM_TOKEN;
const INITIAL_QUERY = `
    {
    query: endpoints (
      first: 1000, filter: {path: "manufacturer", op: CONTAINS, value: "LENOVO"})
      {edges {node {id serialNumber name model manufacturer}}
      pageInfo {hasNextPage endCursor}}
    }
`;
//Do initial request and check for next page
//Create new query and send to function
//Create function that takes a query and returns a TaniumResponse
async function fetchTaniumData(query) {
    var requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "session": TANIUM_TOKEN
        },
        body: JSON.stringify({
            query: query
        }),
    };
    const response = await fetch(BASE_URL, requestOptions);
    let data = await response.json();
    let warranty = JSON.parse(JSON.stringify(data));
    //console.log(warranty.data.query);
    return warranty;
}
function formatQuery(endCursor) {
    let newQuery = `
        {
        query: endpoints (
          first: 1000, after: "${endCursor}", filter: {path: "manufacturer", op: CONTAINS, value: "LENOVO"})
          {edges {node {id serialNumber name model manufacturer}}
          pageInfo {hasNextPage endCursor}}
        }
    `;
    //console.log(newQuery)
    return newQuery;
}
function addToArray(taniumResponse) {
    let computerArray = [];
    let nodes = taniumResponse.data.query.edges;
    //console.log(nodes);
    for (let i = 0; i < nodes.length; i++) {
        let computer = {
            name: nodes[i].node.name,
            serial: nodes[i].node.serialNumber,
        };
        //console.log(computer);
        computerArray.push(computer);
    }
    return computerArray;
}
export async function collectTaniumData() {
    let firstPage = await fetchTaniumData(INITIAL_QUERY);
    let compArray = addToArray(firstPage);
    let nextPage = firstPage.data.query.pageInfo.hasNextPage;
    let endCursor = firstPage.data.query.pageInfo.endCursor;
    while (nextPage) {
        let newQuery = formatQuery(endCursor);
        console.log(newQuery);
        let nextFetch = await fetchTaniumData(newQuery);
        compArray = compArray.concat(addToArray(nextFetch));
        if (nextFetch.data.query.pageInfo.hasNextPage) {
            endCursor = nextFetch.data.query.pageInfo.endCursor;
        }
        else {
            nextPage = false;
        }
    }
    console.log(compArray.length);
    console.log(compArray);
    return compArray;
}
