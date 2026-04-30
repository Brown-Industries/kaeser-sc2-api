# Reference Data and Object IDs

The `ref/` directory contains object discovery captures from several KAESER
SIGMA CONTROL 2 machines:

- `ref/objectdiscovery.ASD35.json`
- `ref/objectdiscovery.BSV80.json`
- `ref/objectdiscovery.DSD205L.json`
- `ref/objectdiscovery.FSG520.json`
- `ref/objectdiscovery.SM15.json`

These files are not used by the runtime service today. They are useful as
fixtures and protocol notes for understanding controller menus and object IDs.

## Discovery Envelope

All current discovery captures use this shape:

```json
{
  "0": 1,
  "1": 1,
  "2": "0",
  "3": {
    "0": {
      "Id": 4104432,
      "Type": 0,
      "SubType": 0,
      "StatusLine": 3163672,
      "Object": [4105504]
    }
  }
}
```

The top-level fields appear to be the SC2 response envelope. Field `"3"` holds
indexed discovery nodes.

## Discovery Node Types

Observed node shapes:

| Type | Meaning inferred from refs |
| --- | --- |
| `0` | Root object. Includes status line and child object IDs. |
| `1` | Main menu node. Example text: `Main menu`. |
| `2` | Named menu or section node. Examples include `Status`, `Performance data`, `Operating data`, and `Maintenance`. |
| `3` | Object/value group. Usually contains an `Object` array of child or leaf IDs. |

The discovery captures are menu/object maps. They generally do not contain live
`Value`, `Unit`, `State`, or report fields. Runtime DTOs expect those fields
from separate value-query responses.

## Runtime Command Shapes

`src/modules/maintenance/maintenance.service.ts` sends several hard-coded
payload shapes to `/json.json`.

| Method | Payload purpose |
| --- | --- |
| `getVersion()` | `{ 0: 1, 1: 7 }` for controller/machine metadata. |
| `getOperational()` | `{ 0: 1, 1: 2, 2: { 0: [ids] } }` for live values by object ID. |
| `getGeneral()` | Same value-query shape for additional general IDs. |
| `getMaintenanceTimers()` | Same value-query shape for maintenance interval and due-in IDs. |
| `getIO()` | `{ 0: "datarecorder", 1: 10, 2: {} }` for I/O recorder data. |
| `getOperatingHours()` | Same value-query shape for operating hour IDs. |
| `getMessages()` | `{ 0: 3, 1: 1, 2: { 0: 0, 1: 0, 2: 101 } }` for message records. |
| `getLedData()` | `{ 0: 1, 1: 4 }` for LED status. |
| `bumpSession()` | `{ 0: 8, 1: 4 }` for session keepalive. |
| `sessionLogout()` | `{ 0: 8, 1: 1 }` for session logout. |

## Current ID Coverage

The implemented DTO IDs match the `ASD35` discovery capture. The same hard-coded
IDs were not found in the other object discovery captures during this pass.
That implies the current data extraction is effectively ASD35-specific even
though the repo stores captures for additional models.

Examples:

| Field | Runtime ID | Runtime code | Discovery location |
| --- | ---: | --- | --- |
| Pressure | `3231568` | `OperationalDto.pressure` | `ASD35` performance data, compressor group |
| Compressor state | `4082904` | `OperationalDto.compressorState` | `ASD35` status group |
| Start mode | `4057536` | `OperationalDto.startMode` | `ASD35` status group |
| Compressor hours | `3261336` | `OperatingHoursDto.compressorHours` | `ASD35` operating hours group |
| Oil filter interval | `3274104` | `MaintenanceTimerDto.oilFilterInterval` | `ASD35` maintenance group |
| Oil filter due-in | `3274264` | `MaintenanceTimerDto.oilFilterDueIn` | `ASD35` maintenance group |

## DTO Response Assumptions

Current DTOs assume these response structures:

- Value queries return `data['3']` as an object whose values include `Id`,
  `Value`, and sometimes `Unit`.
- LED status returns named records such as `led_power_on`, each with `State`.
- I/O data returns `data['3']['iom1']['dis']` for digital inputs and
  `data['3']['iom1']['airs']` for analog/raw values.
- Message data returns records containing `ReportTypeTxt`, `ReportDateTime`,
  `ReportId`, and `Text`.

## Adding Another Model

To add robust support for a model other than ASD35, the service likely needs one
of these approaches:

1. A per-model object ID map selected from `getVersion().CompType`.
2. A discovery parser that resolves stable menu paths into model-specific leaf
   IDs.
3. Separate DTO/query definitions for compressor, blower, vacuum, and oil-free
   machine families if their data groups differ too much.

The reference captures are enough to start a per-model ID mapping effort, but
they are not enough to document the live `Value` response shapes for messages,
LED data, or `datarecorder` I/O.
