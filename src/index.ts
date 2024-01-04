import { warrantyEndDates } from "./lenovo.js"
import { collectTaniumData } from "./tanium.js"



//await testCall()
let taniumEndpoints = await collectTaniumData();

let warranties = await warrantyEndDates(taniumEndpoints);

console.log(warranties);

