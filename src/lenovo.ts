import fetch from 'node-fetch';
import { Computer } from './tanium.js'


const LENOVO_TOKEN = process.env.LENOVO_TOKEN
const BASE_URL = 'https://supportapi.lenovo.com/v2.5/warranty?'

interface warranty {
    Serial: string;
    InWarranty: boolean
    Purchased: string;
    Warranty: warrantyData[]
}

interface warrantyData {
    Name: string;
    Type: string;
    Start: string;
    End: string;
}

export interface computerWarranty {
    serial: string;
    endDate: string;
}


//Take array of serial numbers and form a list of target strings
//Serial=xx,yy,zz
function createTargetStrings(computers: Computer[]): string[] {
    //List of serial numbers seperated by comma. Start with 50 long
    let targetStrings: string[] = [];
    let chunkSize = 50;
    for (let i=0; i < computers.length; i += 50){
        let chunk = computers.slice(i, i + chunkSize).map(x => x.serial).join();
        let target = "Serial=" + chunk;
        targetStrings.push(target);
    }
    return targetStrings;
}

async function fetchLenovo(targets: string): Promise<warranty[]> {
    var requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "ClientID": LENOVO_TOKEN as string
        },
        body: encodeURI(targets)
    }
    const response = await fetch(BASE_URL, requestOptions); 
    let data = await response.json();
    let warranty = JSON.parse(JSON.stringify(data)) as warranty[];
    //console.log(warranty);

    return warranty;
}

//Run all of the fetch requests and store data in array
async function collectWarrantyInfo(targetList: string[]): Promise<warranty[]> {
    let warranties: warranty[] = [];

    for (let i=0; i < targetList.length; i++){
        let warrantyFetch = await fetchLenovo(targetList[i]);
        warranties = warranties.concat(warrantyFetch);
    }

    //console.log(warranties)
    return warranties
}

function getLatestDate(warranty: warranty): string {
    if (!warranty.hasOwnProperty('Warranty')) {
        return "NA"
    }
    let latestDate = new Date(warranty.Warranty[0].End);
    for (let i=0; i < warranty.Warranty.length; i++){
        let date = warranty.Warranty[i].End
        let convertedDate = new Date(date);
        if (latestDate <= convertedDate){
            latestDate = convertedDate
        }
    }

    let year = latestDate.toLocaleString("default",{ year: "numeric" });
    let month = latestDate.toLocaleString("default",{ month: "2-digit" });
    let day = latestDate.toLocaleString("default",{ day: "2-digit" });
    let formattedDate = year + "-" + month + "-" + day;

    return formattedDate
}

export async function warrantyEndDates(computers: Computer[]): Promise<computerWarranty[]>{
    let allWarranties = await collectWarrantyInfo(createTargetStrings(computers))
    let endDates: computerWarranty[] = [];
    
    for (let i = 0; i < allWarranties.length; i++){
        let endDate = getLatestDate(allWarranties[i]) 
        let obj: computerWarranty = {
            serial: allWarranties[i].Serial,
            endDate: endDate 
            //endDate: "test" 
        }
        endDates.push(obj)
    }
    return endDates
}
