# Clock.bh - Bahrain Time for Home Assistant

[![HACS Action](https://github.com/iret33/ha-clock-bh/actions/workflows/validate.yml/badge.svg)](https://github.com/iret33/ha-clock-bh/actions/workflows/validate.yml)
[![hassfest](https://github.com/iret33/ha-clock-bh/actions/workflows/hassfest.yml/badge.svg)](https://github.com/iret33/ha-clock-bh/actions/workflows/hassfest.yml)

A Home Assistant custom integration that provides accurate Bahrain time from [clock.bh](https://clock.bh) - the official Bahrain NTP Time Server.

## About clock.bh

[clock.bh](https://clock.bh) is a free, public NTP (Network Time Protocol) server for the Kingdom of Bahrain, offering accurate time synchronization for servers, computers, and IoT devices in the Middle East region.

## Features

- Real-time Bahrain time (Arabia Standard Time, UTC+3)
- Synced with atomic clocks via clock.bh NTP server
- Automatic updates every 30 seconds
- UI-based configuration (no YAML required)
- Device info linking to clock.bh

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Integrations"
3. Click the "+" button
4. Search for "Clock.bh"
5. Click "Download"
6. Restart Home Assistant

### Manual Installation

1. Download the `custom_components/clock_bh` folder
2. Copy it to your `config/custom_components/` directory
3. Restart Home Assistant

## Configuration

1. Go to **Settings** > **Devices & Services**
2. Click **+ Add Integration**
3. Search for "Clock.bh"
4. Click to add the integration

## Sensor

This integration creates one sensor entity:

| Entity | Description |
|--------|-------------|
| `sensor.clock_bh_bahrain_time` | Current Bahrain time from clock.bh |

### Attributes

| Attribute | Value |
|-----------|-------|
| `source` | clock.bh |
| `timezone` | Asia/Bahrain |
| `utc_offset` | +03:00 |
| `attribution` | Time data provided by clock.bh - Bahrain NTP Time Server |

## Example Automation

```yaml
automation:
  - alias: "Announce Bahrain Time"
    trigger:
      - platform: time_pattern
        hours: "*"
        minutes: "0"
    action:
      - service: tts.speak
        data:
          message: "The time in Bahrain is {{ states('sensor.clock_bh_bahrain_time') }}"
```

## Links

- [clock.bh](https://clock.bh) - Bahrain NTP Time Server
- [Report Issues](https://github.com/iret33/ha-clock-bh/issues)

## License

MIT License - see [LICENSE](LICENSE) file for details.
