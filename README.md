# lenovium
Lenovium is a service that queries the Tanium API to gather all the Lenovo machines in your tenant. It then takes the serial 
numbers and queries the Lenovo Warranty API to get the warranty information on each PC. After that it grabs the warranty 
end date and sends it back to Tanium Asset. This allows you to see in Tanium when your Lenovo PCs are out of warranty.

### Reference
[API Docs](https://supportapi.lenovo.com/Documentation/Index.html)


### .ENV File
You will need to create a .env file at the root that looks like the following:
```
LENOVO_TOKEN=<your token here>
TANIUM_TOKEN=<your token here>
TANIUM_TARGET=<Enter your Tanium cloud sub domain. It would be 'contoso' if your company was contoso.cloud.tanium.com>
```

### Setup Environment
- Create an API key in Tanium
- You can work with your Lenovo rep to get an API key for the warranty API.
- Within Tanium under the Asset module -> Iventory management -> Sources create an 'Import API' source and name it "Dell Warranty End Date".
    - Enable Reconciliation and match on the serial number. Add the following mapping:
    ```
    {
        "keys": [
            "serial_number"
        ],
        "fieldMaps": [
        {
            "source": "serial",
            "destination": "serial_number"
        },
        {
            "source": "end_date",
            "destination": "lenovo_warranty_expiration"
        }
        ]
    }
    ```
- Also under Inventory Management create a new asset custom attribute called "Lenovo Warranty Expiration"

### Run it
Run either of the following commands at the root of the project:
```
npm run tsc && node --env-file .env ./built/index.js
```
or
```
npm run test
```
