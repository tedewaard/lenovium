import fetch from 'node-fetch';
import { Computer } from './tanium.js'


const LENOVO_TOKEN = process.env.LENOVO_TOKEN
const TEST_TARGET = 'https://supportapi.lenovo.com/v2.5/warranty?Serial=PF42ZLHB'
const BASE_URL = 'https://supportapi.lenovo.com/v2.5/warranty?Serial='

interface warrantyData {
    Name: string;
    Type: string;
    Start: string;
    End: string;
}

interface warranty {
    Serial: string;
    InWarranty: boolean
    Purchased: string;
    Warranty: warrantyData[]
}

//Take array of serial numbers and form a list of target strings
//Serial=xx,yy,zz
export function createTargetStrings(computers: Computer[]): string[] {
    const BASE_URL = `https://supportapi.lenovo.com/v2.5/warranty?Serial=`
    //List of serial numbers seperated by comma. Start with 50 long
    let targetStrings: string[] = [];
    let chunkSize = 50;
    for (let i=0; i < computers.length; i += 50){
        let chunk = computers.slice(i, i + chunkSize).map(x => x.serial).join();
        let target = BASE_URL + chunk;
        targetStrings.push(target);
    }
    return targetStrings;
}




export async function testCall() {
    var myHeaders = new Headers();
    myHeaders.append("ClientID", LENOVO_TOKEN as string);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
    }

    const response = await fetch(TEST_TARGET, requestOptions); 

    let data = await response.json();
    let warranty = JSON.parse(JSON.stringify(data)) as warranty;
    console.log(warranty.Warranty[0].End);
    console.log(warranty.InWarranty);
}
