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
export async function pushTaniumData(query) {
    var requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "session": TANIUM_TOKEN
        },
        body: query
    };
    const response = await fetch(BASE_URL, requestOptions);
    let data = await response.json();
    return data;
}
function formatRequestQuery(endCursor) {
    let newQuery = `
        {
        query: endpoints (
          first: 1000, after: "${endCursor}", filter: {path: "manufacturer", op: CONTAINS, value: "LENOVO"})
          {edges {node {id serialNumber name model manufacturer}}
          pageInfo {hasNextPage endCursor}}
        }
    `;
    return newQuery;
}
//TODO: How to format the data in this mutation query?
function formatImportQuery(data) {
    let query = "mutation importAssets($source: String!, $json: String!) {assetsImport(input: {sourceName: $source, json: $json}) {assets {id index status}}}";
    let json = data;
    let variablesString = {
        "source": "Lenovo Warranty End Date",
        "json": json
    };
    let newQuery = JSON.stringify({
        query: query,
        variables: variablesString
    });
    return newQuery;
}
//Apparently one import can handle up to 5000 endpoints
//TODO: Future proof incase we hit 5000 endpoints
export function formatImportData(data) {
    let a = [];
    //"[{\"serial\": \"MJ0FCALB\", \"end_date\": \"2024-12-16\"}, {\"serial\": \"PF2QDS4K\", \"end_date\": \"2022-09-19\"}]"
    let start = `[`;
    let end = `]`;
    for (let i = 0; i < data.length; i++) {
        let serial = data[i].serial;
        let end_date = data[i].endDate;
        let s = `{\"serial\": \"${serial}\", \"end_date\": \"${end_date}\"}`;
        a.push(s);
    }
    let joined = a.join();
    //console.log(start + joined + end);
    return start + joined + end;
}
function addToArray(taniumResponse) {
    let computerArray = [];
    let nodes = taniumResponse.data.query.edges;
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
        let newQuery = formatRequestQuery(endCursor);
        //console.log(newQuery);
        let nextFetch = await fetchTaniumData(newQuery);
        compArray = compArray.concat(addToArray(nextFetch));
        if (nextFetch.data.query.pageInfo.hasNextPage) {
            endCursor = nextFetch.data.query.pageInfo.endCursor;
        }
        else {
            nextPage = false;
        }
    }
    //console.log(compArray.length);
    //console.log(compArray);
    return compArray;
}
//export async function updateTaniumData() {
export async function updateTaniumData(data) {
    //let s = "[{\"serial\": \"MJ0A492A\", \"end_date\": \"2022-11-17\"},{\"serial\": \"PF42QXZ0\", \"end_date\": \"2025-11-30\"},{\"serial\": \"PF2XZ1W5\", \"end_date\": \"2024-09-09\"},{\"serial\": \"PF2XE8VP\", \"end_date\": \"2024-08-26\"},{\"serial\": \"PF3NBQRC\", \"end_date\": \"2025-05-25\"},{\"serial\": \"PF3Y2MK4\", \"end_date\": \"2025-10-09\"}]"
    let formattedData = formatImportData(data);
    let formattedQuery = formatImportQuery(formattedData);
    //console.log(formattedQuery)
    //let formattedQuery = formatImportQuery(s);
    let push = await pushTaniumData(formattedQuery);
    console.log(JSON.stringify(push));
}
