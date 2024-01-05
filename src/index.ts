import { warrantyEndDates } from "./lenovo.js"
import { formatImportData, collectTaniumData } from "./tanium.js"



//await testCall()
let taniumEndpoints = await collectTaniumData();

let warranties = await warrantyEndDates(taniumEndpoints);

formatImportData(warranties);

//console.log(warranties);

