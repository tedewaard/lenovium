import { warrantyEndDates } from "./lenovo.js"
import { updateTaniumData, collectTaniumData } from "./tanium.js"


let taniumEndpoints = await collectTaniumData();

let warranties = await warrantyEndDates(taniumEndpoints);

await updateTaniumData(warranties);

