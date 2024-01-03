import fetch from 'node-fetch';
const LENOVO_TOKEN = process.env.LENOVO_TOKEN;
const TEST_TARGET = 'https://supportapi.lenovo.com/v2.5/warranty?Serial=PF42ZLHB,MJ0A492A';
const TEST_TARGET2 = 'https://supportapi.lenovo.com/v2.5/warranty?';
const BASE_URL = 'https://supportapi.lenovo.com/v2.5/warranty?Serial=';
//Take array of serial numbers and form a list of target strings
//Serial=xx,yy,zz
function createTargetStrings(computers) {
    //List of serial numbers seperated by comma. Start with 50 long
    let targetStrings = [];
    let chunkSize = 50;
    for (let i = 0; i < computers.length; i += 50) {
        let chunk = computers.slice(i, i + chunkSize).map(x => x.serial).join();
        let target = "Serial=" + chunk;
        targetStrings.push(target);
    }
    return targetStrings;
}
async function fetchLenovo(targets) {
    var requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "ClientID": LENOVO_TOKEN
        },
        body: encodeURI(targets)
    };
    console.log(requestOptions);
    const response = await fetch(TEST_TARGET2, requestOptions);
    let data = await response.json();
    console.log(data);
    return [];
}
export function warrantyEndDates() {
}
export async function testCall() {
    let serials = "Serial=PF42ZLHB,MJ0A492A";
    var requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "ClientID": LENOVO_TOKEN
        },
        body: encodeURI(serials)
    };
    console.log(requestOptions);
    const response = await fetch(TEST_TARGET2, requestOptions);
    let data = await response.json();
    // console.log(data);
    let warranty = JSON.parse(JSON.stringify(data));
    console.log(warranty);
}
