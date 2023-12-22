import fetch from 'node-fetch';
const TOKEN = process.env.TOKEN;
const TEST_TARGET = 'https://supportapi.lenovo.com/v2.5/warranty?Serial=PF42ZLHB';
const BASE_URL = 'https://supportapi.lenovo.com/v2.5/warranty?Serial=';
//Take array of serial numbers and form a list of target strings
//Serial=xx,yy,zz
function createTargetStrings(serialNums) {
}
export async function testCall() {
    var myHeaders = new Headers();
    myHeaders.append("ClientID", TOKEN);
    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
    };
    const response = await fetch(TEST_TARGET, requestOptions);
    let data = await response.json();
    let warranty = JSON.parse(JSON.stringify(data));
    console.log(warranty.Warranty[0].End);
    console.log(warranty.InWarranty);
}
