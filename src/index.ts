import { warrantyEndDates } from "./lenovo.js"
import { updateTaniumData, collectTaniumData } from "./tanium.js"


let taniumEndpoints = await collectTaniumData();

let warranties = await warrantyEndDates(taniumEndpoints);

let push = await updateTaniumData(warranties);
//let push = await updateTaniumData();

//console.log(push);

