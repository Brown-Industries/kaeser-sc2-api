# SIGMA CONTROL 2 Research Notes

These notes separate official KAESER documentation from behavior inferred from
this repository. The repository's direct `/json.json` calls and numeric object
IDs appear reverse-engineered from KAESER CONNECT traffic; they were not found
in public KAESER API documentation.

## What SIGMA CONTROL 2 Is

KAESER describes SIGMA CONTROL 2 as an industrial-PC-based local controller for
compressed air equipment. It coordinates compressed air generation and
consumption, protects the unit, supports networking and remote monitoring, and
uses interchangeable input/output modules.

Official KAESER pages state that SIGMA CONTROL 2 is used across rotary screw
compressors, rotary screw blowers, reciprocating compressors, boosters, rotary
lobe blowers, integrated blowers, and DNC booster packages.

Primary sources:

- KAESER US, "Compressed Air Flow Control Units":
  https://us.kaeser.com/products-and-solutions/controllers/unit-controllers/
- KAESER US, "3 to 30 hp Rotary Screw Compressors":
  https://us.kaeser.com/products-and-solutions/rotary-screw-compressors/belt-drive/
- KAESER US, "Rotary Screw Air Blowers":
  https://us.kaeser.com/products-and-solutions/blowers/rotary-screw-blowers/
- KAESER SIGMA CONTROL 2 product literature:
  https://us.kaeser.com/download.ashx?id=tcm%3A46-52115

## Officially Documented Controller Concepts

Official KAESER pages and product literature describe these concepts, which line
up with this repository's data groups:

- Automatic monitoring and control.
- Traffic-light style operating status LEDs.
- Plain-text display and 30 selectable languages.
- Pressure and temperature graphing.
- Message history, warnings, faults, and maintenance messages.
- Operating data and service/load hours.
- Input/output display.
- Timers and base-load sequencing for two compressors.
- Control modes including Dual, Quadro, Vario, Dynamic, and Continuous.
- SD-card slot for updates and long-term operating data storage.
- RFID reader for access control.
- Ethernet for SIGMA NETWORK, master/slave operation, and KAESER CONNECT web
  server access.
- Optional communication modules including Profibus, PROFINET, Modbus TCP,
  Modbus RTU, DeviceNet, and EtherNet/IP.

KAESER's blower documentation describes KAESER CONNECT as browser access to the
integrated web server, using the controller IP address and password. It also
describes real-time machine status, analog/digital input views, warning and
fault messages, and pressure/temperature/speed trends.

## KAESER CONNECT vs This Repository

KAESER CONNECT is the browser UI exposed by the controller's web server. Manual
mirrors show a browser login flow and menus such as system status, graphs,
messages, I/O display, user management, settings, backup, and data recording.

Useful manual mirror sources:

- KAESER CONNECT page:
  https://www.manualslib.com/manual/2364548/Kaeser-Sigma-Control-2.html?page=78
- Menu structure and maintenance concepts:
  https://www.manualslib.com/manual/2999960/Kaeser-Kompressoren-Sigma-Control-2.html?controller=view&page=78

This repository does not automate the visible browser UI. It uses the same web
server at a lower level:

- `GET /login.html?...` obtains or refreshes an authenticated web session.
- `POST /json.json` sends numeric command envelopes.
- `Session-Id`, `Session-Key`, and `Session-Auth` maintain the session.

Those details are inferred from the code and controller behavior. Treat them as
implementation knowledge, not a vendor-supported public API.

## Authentication Notes

Official KAESER material documents RFID-based access, user/service login
protection, and password-protected web access. Public sources found during this
research did not describe the repository's `Session-Auth` hash, `Session-Id`,
`Session-Key`, or `/json.json` protocol.

The implementation computes:

```text
sha256(sha256(username + ':user@sc2:' + password) + ':' + sessionKey)
```

and sends that value as `Session-Auth`.

## Model Alignment

The repo contains object discovery captures for these model names:

- `ASD35`
- `BSV80`
- `DSD205L`
- `FSG520`
- `SM15`

Research alignment:

| Model | Notes |
| --- | --- |
| `ASD35` | Official KAESER pages list ASD 35 family compressors and SIGMA CONTROL 2 features. |
| `SM15` | Official KAESER US belt-drive pages cover SM series machines up to 15 hp and describe SIGMA CONTROL 2, Ethernet, RFID, and web server features. |
| `DSD205L` | Official KAESER pages and literature cover DSD 205 family compressors. The exact `L` suffix was not confirmed in the public sources found. |
| `FSG520` | KAESER-branded pages list FSG 520-2 oil-free rotary screw packages. SIGMA CONTROL 2 support is inferred from KAESER's broader controller coverage statements. |
| `BSV80` | Third-party listings tie BSV 80 vacuum pumps to SIGMA CONTROL 2, but a current official KAESER page for the exact model was not found during this pass. |

## Safety Boundary

The current service is read-focused. The README mentions closed-loop remote
start only through external relay hardware, with this service verifying state.
No start/stop command is implemented in the code reviewed here.
