import fetch from 'node-fetch';
import { computerWarranty } from './lenovo.js';

const TANIUM_TARGET = process.env.TANIUM_TARGET
const TANIUM_TOKEN = process.env.TANIUM_TOKEN
const BASE_URL = `https://${TANIUM_TARGET}-api.cloud.tanium.com/plugin/products/gateway/graphql`

interface TaniumResponse {
    data: TaniumData 
}

interface TaniumData {
    query: TaniumQuery 
}
interface TaniumQuery {
    edges: TaniumEdges[]
    pageInfo: TaniumPageInfo
}
interface TaniumEdges {
    node: TaniumNode,
}
interface TaniumNode {
    serialNumber: string,
    name: string,
    model: string,
}
interface TaniumPageInfo {
    hasNextPage: boolean,
    endCursor: string,
}
export interface Computer {
    name: string,
    serial: string,
}

interface UpdateResponse {
    data: UpdateData
}
interface UpdateData {
    assetsImport: UpdateAssetsImport
}
interface UpdateAssetsImport {
    assets: UpdateAssets[]
}
interface UpdateAssets {
    id: number,
    index: number,
    status: string
}
 
const INITIAL_QUERY = `
    {
    query: endpoints (
      first: 1000, filter: {path: "manufacturer", op: CONTAINS, value: "LENOVO"})
      {edges {node {id serialNumber name model manufacturer}}
      pageInfo {hasNextPage endCursor}}
    }
`
//Do initial request and check for next page
//Create new query and send to function
//Create function that takes a query and returns a TaniumResponse

async function fetchTaniumData(query: string): Promise<TaniumResponse> {
    var requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "session": TANIUM_TOKEN as string
        },
        body: JSON.stringify({
            query: query}),
    }
    const response = await fetch(BASE_URL, requestOptions); 
    let data = await response.json();
    let warranty: TaniumResponse = JSON.parse(JSON.stringify(data));
    //console.log(warranty.data.query);
    return warranty;
}

export async function pushTaniumData(query: string) {
    var requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "session": TANIUM_TOKEN as string
        },
        body: query 
    }
    const response = await fetch(BASE_URL, requestOptions); 
    let data = await response.json();
    return data;
}

function formatRequestQuery(endCursor: string): string {
    let newQuery = `
        {
        query: endpoints (
          first: 1000, after: "${endCursor}", filter: {path: "manufacturer", op: CONTAINS, value: "LENOVO"})
          {edges {node {id serialNumber name model manufacturer}}
          pageInfo {hasNextPage endCursor}}
        }
    `
    return newQuery
}

//TODO: How to format the data in this mutation query?
function formatImportQuery(data: string): string {
    let query = "mutation importAssets($source: String!, $json: String!) {assetsImport(input: {sourceName: $source, json: $json}) {assets {id index status}}}"
    let json = data;


    let variablesString = {
        "source":"Lenovo Warranty End Date",
        "json": json
    }

    let newQuery = JSON.stringify({
        query: query,
        variables: variablesString
    })
    return newQuery
}

//Apparently one import can handle up to 5000 endpoints
//TODO: Future proof incase we hit 5000 endpoints
export function formatImportData(data: computerWarranty[]): string {
    let a: string[] = []
    //"[{\"serial\": \"MJ0FCALB\", \"end_date\": \"2024-12-16\"}, {\"serial\": \"PF2QDS4K\", \"end_date\": \"2022-09-19\"}]"
    let start = `[`
    let end = `]`
    for (let i=0; i<data.length; i++) {
        let serial = data[i].serial
        let end_date = data[i].endDate
        let s = `{\"serial\": \"${serial}\", \"end_date\": \"${end_date}\"}`
        a.push(s);
    }

    let joined = a.join()
    //console.log(start + joined + end);

    return start + joined + end;
}

function addToArray(taniumResponse: TaniumResponse): Computer[] {
    let computerArray: Computer[] = [];
    let nodes = taniumResponse.data.query.edges
    for (let i = 0; i < nodes.length; i++) {
        let computer: Computer = {
            name: nodes[i].node.name,
            serial: nodes[i].node.serialNumber,
        }
        //console.log(computer);
        computerArray.push(computer);
    }
    return computerArray;
}

export async function collectTaniumData(): Promise<Computer[]> {
    let firstPage = await fetchTaniumData(INITIAL_QUERY);
    let compArray = addToArray(firstPage); 
    let nextPage = firstPage.data.query.pageInfo.hasNextPage;
    let endCursor = firstPage.data.query.pageInfo.endCursor
    while (nextPage){
        let newQuery = formatRequestQuery(endCursor);
        //console.log(newQuery);
        let nextFetch = await fetchTaniumData(newQuery);
        compArray = compArray.concat(addToArray(nextFetch));
        if (nextFetch.data.query.pageInfo.hasNextPage){
            endCursor = nextFetch.data.query.pageInfo.endCursor;
        } else {
            nextPage = false;
        }
    }
    //console.log(compArray.length);
    //console.log(compArray);
    return compArray;
}

//export async function updateTaniumData() {
export async function updateTaniumData(data: computerWarranty[]) {
    let formattedData = formatImportData(data);
    let formattedQuery = formatImportQuery(formattedData);
    let push = await pushTaniumData(formattedQuery);
    let response: UpdateResponse  = JSON.parse(JSON.stringify(push));
    analyzeResponse(response);
}

function analyzeResponse(response: UpdateResponse) {
    let createdCount = 0; 
    let noChangeCount = 0;
    let responses = response.data.assetsImport.assets
    for (let i=0; i< responses.length; i++) {
        if (responses[i].status == "NoChange"){
           noChangeCount++;
        }
        if (responses[i].status == "Created"){
            createdCount++;
        }
    }
    console.log("Updates: " + createdCount + "\nNo Updates: " + noChangeCount)
}
