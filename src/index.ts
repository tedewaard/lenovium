import { createTargetStrings } from "./lenovo.js"
import { collectTaniumData } from "./tanium.js"



//testCall()
let taniumEndpoints = await collectTaniumData()

let test = createTargetStrings(taniumEndpoints);

console.log(test);
