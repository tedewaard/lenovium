//import fetch from 'node-fetch';
import {request, gql} from 'graphql-request'

const BASE_URL = 'https://hm-api.cloud.tanium.com/plugin/products/gateway/graphql'
const TANIUM_TOKEN = process.env.TANIUM_TOKEN

//Grab all lenovo serial numbers from Tanium
//{
//query: endpoints (
//  first: 1000, filter: {path: "manufacturer", op: CONTAINS, value: "Dell"})
//  {edges {node {id serialNumber name model manufacturer}}
//  pageInfo {hasNextPage endCursor}}
//}
//

const query = gql`
    {
    query: endpoints (
      first: 1000, filter: {path: "manufacturer", op: CONTAINS, value: "Dell"})
      {edges {node {id serialNumber name model manufacturer}}
      pageInfo {hasNextPage endCursor}}
    }
`

/*
async function getSerialNums(){
    var myHeaders = new Headers();
    myHeaders.append("session", TANIUM_TOKEN as string);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
    }

    const response = await fetch(TEST_TARGET, requestOptions); 

    let data = await response.json();
    let warranty = JSON.parse(JSON.stringify(data)) as warranty;

}

//Import warranty info into Tanium
*/
