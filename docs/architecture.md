# Architecture and Runtime Behavior

This service is a NestJS API that reads data from a KAESER SIGMA CONTROL 2
controller and exposes the result over HTTP and, optionally, MQTT. The compressor
side is not a documented public REST API. The service talks to the controller's
KAESER CONNECT web interface by posting command payloads to `/json.json` and by
refreshing the web session through `/login.html`.

## Runtime Shape

- `src/main.ts` starts the app on port `3004`, sets the global prefix to `api`,
  enables URI versioning with default version `1`, and hosts Swagger at `/api`.
- `src/app.module.ts` loads `config/kaeser_sc2.env`, logging, scheduling,
  automapper, the maintenance module, the task scheduler, and MQTT support.
- `src/modules/maintenance/maintenance.module.ts` registers the outbound
  `HttpModule` with `baseURL = KAESER_ADDRESS`, a 50 second timeout, keepalive
  agents, and `maxSockets: 1`. The one-socket limit matters because the
  controller can only handle a small number of concurrent requests.
- `src/warmup.service.ts` blocks application startup until `GET /login.html` on
  the compressor responds with HTTP 200. This currently assumes plain HTTP on
  port 80 and assumes `KAESER_ADDRESS` is set.

## Configuration

The app expects `config/kaeser_sc2.env`.

Required compressor settings:

```env
KAESER_ADDRESS=http://compressor.example.local
KAESER_USERNAME=readOnlyUser
KAESER_PASSWORD=readOnlyUserPass
```

Optional MQTT settings. MQTT is disabled unless all of these are set:

```env
MQTT_HOST=192.168.1.10
MQTT_PORT=1883
MQTT_USER=mqttUser
MQTT_PASS=mqttPass
MQTT_TOPIC_ROOT=kaeser-sc2-01
```

Optional logging:

```env
LOG_LEVEL=info
```

## HTTP Surface

With the global prefix and URI versioning, the runtime routes are expected under
`/api/v1`.

| Route | Behavior |
| --- | --- |
| `GET /api/v1` | Health check returning `I'm alive!`. |
| `GET /api/v1/maintenance` | Aggregate data selected by the `data` query parameter. |
| `GET /api/v1/maintenance/logout` | Sends the compressor session logout command. |
| `GET /api/v1/maintenance/version` | Reads controller and compressor version metadata. |
| `GET /api/v1/maintenance/general` | Reads a hard-coded general data payload. |
| `GET /api/v1/maintenance/maintenance-timers` | Reads maintenance intervals and remaining hours. |
| `GET /api/v1/maintenance/messages` | Reads operational, warning, fault, diagnostic, and system messages returned by the controller. |
| `GET /api/v1/maintenance/led-data` | Reads front-panel style LED state. |

The aggregate `GET /maintenance` endpoint returns an empty object unless `data`
is provided. The validator currently accepts enum keys, not enum values. Example:

```text
GET /api/v1/maintenance?data=Operational&data=Messages
```

Known aggregate keys:

- `Operational`
- `Maintenance`
- `OperatingHours`
- `IO_Module`
- `Messages`

## Compressor Session Flow

`AuthRefreshInterceptor` owns the outbound controller session.

1. It hashes `KAESER_USERNAME + ':user@sc2:' + KAESER_PASSWORD`.
2. Outbound requests receive JSON content type plus unit preference cookies.
3. If a compressor response looks unauthenticated, the interceptor calls
   `/login.html?...` with `Username`, `Session-Auth`, and SC2 cookies.
4. It parses `Session-Id` and `Session-Key` from `Set-Cookie`, derives a new
   `Session-Auth`, stores it, and replays the original request.
5. `ECONNRESET`, `ECONNREFUSED`, or an over-session-limit login response block
   outbound requests for 60 seconds.

The README warning about one service instance per compressor user comes from
this session behavior. The controller can reject concurrent use of the same
account and force a cooldown.

## Data Flow

`MaintenanceService` is the only service that talks to `/json.json`. It builds
SC2 command envelopes and maps `response.data['3']` into DTOs:

- `OperationalDto` reads power state, compressor state, start mode, pressure,
  inlet temperature, outlet temperature, motor temperature, and last power
  change.
- `MaintenanceTimerDto` reads service intervals and remaining hours for oil
  filter, oil separator, oil change, air filter, valve inspection,
  belt/coupling, compressor motor bearing lubrication, bearing change, fan motor
  bearing, and annual maintenance due date.
- `OperatingHoursDto` reads compressor, on-load, motor, compressor block, and
  SIGMA CONTROL operating hours.
- `IOMDto` reads `data['3']['iom1']['dis']` as boolean digital inputs and
  `data['3']['iom1']['airs']` as analog output/raw values.
- `MessagesDto` reads report records containing report type, timestamp, ID, and
  message text.
- `QuickStatusDto` reads LED `State` values for power, idle, load, error,
  voltage error, maintenance, remote, and clock.

## MQTT Behavior

If MQTT is configured, `MqttService` publishes retained QoS 1 messages under
`${MQTT_TOPIC_ROOT}/<subtopic>`.

| Schedule | Topic suffix | Payload wrapper |
| --- | --- | --- |
| Every second | `operational-data` | `{ "operational-data": ... }` |
| Every 10 seconds | `status` only if session bump changes state | Session keepalive via `bumpSession()` |
| Every minute | `maintenance-timers` | `{ "maintenance-timers": ... }` |
| Every minute | `messages` | `{ "messages": ... }` |
| Every minute | `operating-hours` | `{ "operating-hours": ... }` |
| Every minute | `led-data` | `{ "led-data": ... }` |

The MQTT Last Will publishes `{ "state": "offline" }` to
`${MQTT_TOPIC_ROOT}/status`; successful connection publishes `{ "state":
"online" }`.

## Compatibility Notes

- Some public response names are misspelled in code and examples. `maintence`,
  `MaintenceTimerData`, and `oilSeperator` should be treated as existing API
  contract names unless a breaking-change migration is planned.
- DTO date parsing strips `AM` and `PM` before calling `new Date(...)`.
  Maintenance dates are assumed to be `MM/DD/YY`.
- `GET /maintenance/logout` sends a controller logout command, but the cached
  interceptor session fields are not explicitly cleared.
- If a scheduled compressor read fails while MQTT is active, `TaskService` sets
  MQTT status false. Because scheduled jobs first check `mqttService.isActive()`,
  this can prevent later scheduled recovery attempts until something else
  changes the MQTT status.
