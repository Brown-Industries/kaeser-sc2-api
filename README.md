# kaeser-sc2-api
This application is designed to make it easy to stream data off of Kaseser compressors with the Sigma Connect 2 control. It manages reconnects, authorization renewal, and more automatically.
There are two ways to consume data from this service, REST and MQTT.

Made to be run as a docker container, can be run either way.

Note: Run one service instance for each compressor. Due to how Kaeser is authenticating their users you cannot connect with the same user multiple times. Doing so will trigger a cooldown period where the service will be unable to connect to the compressor as that user.

## Use Cases
* Remotely monitoring and recording compressor statistics
* Closed loop remote-start
  * Note: This services does not have the ability to start the compressor, however, using the remote relay input you can use this service to very the comrpessor state when paired with a remote relay.

Example: This service is currently deployed to expose compressor data that is written to an Influx database with grafana dashboards. So far it has been useful for troubleshooting compressor issues, automated remote compressor start and shutdown, etc.

## Behavior
* API documentation and endpoints can be found at `/api`
* Polls compressor at regular intervals for data and publishes to MQTT broker.
  * operationa-data is published every 1 second
  * maintence-timers, operating-hours, and led-data is published every 1 minute

## Parameters:
The application will look for an environment file called "kaeser_sc2.env" at launch in 'config': ./config/kaeser_sc2.env.
The env file needs the following:

**KAESER_ADDRESS=http://kompressor.domain.com**
REQUIRED: An IP or URL to the Sigma Connect 2 web portal.
**KAESER_USERNAME=readOnlyUser**
REQUIRED: Username to a read-only or higher level account. This account should be uses exclusively for this service.
**KAESER_PASSWORD=readOnlyUserPass**
REQUIRED: Password to the above account

The MQTT configuration is optional, if it is not provided then the service will simply run without the scheduled tasks to publish to a broker.
**MQTT_HOST=192.168.1.0**
OPTIONAL: An IP or URL to an MQTT broker.
**MQTT_PORT=1883**
OPTIONAL: Defaults to 1883
**MQTT_USER=mqttUser**
REQUIRED (IF using MQTT): User to connect to MQTT broker to write data.
**MQTT_PASS=mqqtPass**
REQUIRED (IF using MQTT): Password to connect to MQTT broker to write data.
**MQTT_TOPIC_ROOT=kaeser-sc2-01**
REQUIRED (IF using MQTT): The topic to publish the compressor data on.

## Support
I am leaving documentation slim for now as I am not sure many will use this. Please post an issue or reach out for help getting this running or adding data if needed.

## Data Provided
It is possible to retrieve all data available that can be found at the control or through the standard web interface. This service currently focuses on providing pressures, temperatures, maintence timers, and run modes. Data published thorugh the rest api is duplicated to the MQTT output. Example data output is shown for a few of the transactions below, however, visit /api for a swagger page on the running app.

## Data Examples
### GET /maintenance
```
{
    "operational": {
        "powerState": "on",
        "compressorState": "load",
        "startMode": "remote",
        "pressure": {
            "value": 101.6,
            "unit": "psi"
        },
        "inletTemp": {
            "value": 75.6,
            "unit": "°F"
        },
        "outletTemp": {
            "value": 168.4,
            "unit": "°F"
        },
        "motorTemp": {
            "value": 128,
            "unit": "°F"
        },
        "lastPowerChange": "2024-02-10T08:16:42.000Z"
    },
    "iom": {
        "digitalIn": [
            true,
            true,
            false,
            true,
            true,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            true,
            false,
            false,
            true
        ],
        "analogOut": [
            12920,
            0,
            10994,
            12100,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ]
    },
    "messages": [
        {
            "messageType": "Operational",
            "messageId": 9,
            "messageDate": "2024-02-12T11:47:04.000Z",
            "message": "Compressor on"
        },
        {
            "messageType": "Operational",
            "messageId": 10,
            "messageDate": "2024-01-31T14:43:56.000Z",
            "message": "Controller on"
        },
        {
            "messageType": "Warning",
            "messageId": 49,
            "messageDate": "2024-01-07T21:07:26.000Z",
            "message": "Annual maintenance"
        }
    ],
    "maintence": {
        "oilFilter": {
            "dueIn": 1213,
            "interval": 3000
        },
        "oilSeperator": {
            "dueIn": 1000,
            "interval": 6000
        },
        "oilChange": {
            "dueIn": 1213,
            "interval": 3000
        },
        "airFilter": {
            "dueIn": 1213,
            "interval": 3000
        },
        "valveInspection": {
            "dueIn": 1079,
            "interval": 12000
        },
        "beltCoupling": {
            "dueIn": 1213,
            "interval": 3000
        },
        "compMotorBearingLube": {
            "dueIn": 1000,
            "interval": 6000
        },
        "bearingChange": {
            "dueIn": 18604,
            "interval": 36000
        },
        "fanMotorBearing": {
            "dueIn": 7671,
            "interval": 12000
        },
        "annualMaintenanceDue": "2020-12-08T06:00:00.000Z"
    },
    "operatingHours": {
        "compressorHours": 17396,
        "onLoadHours": 6239,
        "motorHours": 17396,
        "compressorBlockHours": 17396,
        "sigmaControlHours": 54689
    }
}
```

### GET /led-data
```
{
    "powerOn": true,
    "idle": false,
    "load": true,
    "error": false,
    "errorVoltage": false,
    "maintenanceDue": true,
    "remoteEnabled": true,
    "clockEnabled": false
}
```

### GET /maintenance/messages
```
[
    {
        "messageType": "Operational",
        "messageId": 9,
        "messageDate": "2024-02-12T11:47:04.000Z",
        "message": "Compressor on"
    },
    {
        "messageType": "Operational",
        "messageId": 10,
        "messageDate": "2024-01-31T14:43:56.000Z",
        "message": "Controller on"
    },
    {
        "messageType": "Warning",
        "messageId": 49,
        "messageDate": "2024-01-07T21:07:26.000Z",
        "message": "Annual maintenance"
    }
]
```

### GET /maintenance/maintenance-timers
```
{
    "oilFilter": {
        "dueIn": 1212,
        "interval": 3000
    },
    "oilSeperator": {
        "dueIn": 999,
        "interval": 6000
    },
    "oilChange": {
        "dueIn": 1212,
        "interval": 3000
    },
    "airFilter": {
        "dueIn": 1212,
        "interval": 3000
    },
    "valveInspection": {
        "dueIn": 1078,
        "interval": 12000
    },
    "beltCoupling": {
        "dueIn": 1212,
        "interval": 3000
    },
    "compMotorBearingLube": {
        "dueIn": 999,
        "interval": 6000
    },
    "bearingChange": {
        "dueIn": 18603,
        "interval": 36000
    },
    "fanMotorBearing": {
        "dueIn": 7670,
        "interval": 12000
    },
    "annualMaintenanceDue": "2020-12-08T06:00:00.000Z"
}
```

### GET /maintenance/version
```
{
    "0": 1,
    "1": 7,
    "2": "0",
    "3": {
        "PN": "101618.0",
        "SN": "XXXX",
        "EN": "XXXXXXX",
        "PNMCS": "X.XXXXPX",
        "SNMCS": "XXXXXX",
        "SWMCS": "fluid_1.5.0",
        "CompSeqNum": "1",
        "CompType": "ASD35"
    }
}
```