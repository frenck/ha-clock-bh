# Clock.bh - World Time for Home Assistant

[![HACS Action](https://github.com/iret33/ha-clock-bh/actions/workflows/validate.yml/badge.svg)](https://github.com/iret33/ha-clock-bh/actions/workflows/validate.yml)
[![hassfest](https://github.com/iret33/ha-clock-bh/actions/workflows/hassfest.yml/badge.svg)](https://github.com/iret33/ha-clock-bh/actions/workflows/hassfest.yml)

A Home Assistant custom integration that provides accurate world time from [clock.bh](https://clock.bh) - the official Bahrain NTP Time Server.

## About clock.bh

[clock.bh](https://clock.bh) is a free, public NTP (Network Time Protocol) server for the Kingdom of Bahrain, offering accurate time synchronization for servers, computers, and IoT devices in the Middle East region.

## Features

- **Any Timezone Support** - Select from 400+ timezones worldwide
- **Multiple Instances** - Add multiple clocks for different timezones
- Synced with atomic clocks via clock.bh NTP server
- Automatic updates every 30 seconds
- UI-based configuration (no YAML required)
- Common timezones highlighted for quick selection

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
4. Select your desired timezone from the dropdown
5. Click Submit

You can add multiple instances for different timezones!

## Sensor

This integration creates one sensor entity per configured timezone:

| Entity | Description |
|--------|-------------|
| `sensor.clock_bh_[timezone]_time` | Current time in selected timezone |

### Attributes

| Attribute | Description |
|-----------|-------------|
| `source` | clock.bh |
| `timezone` | Selected timezone (e.g., Asia/Bahrain) |
| `utc_offset` | UTC offset (e.g., +03:00) |
| `attribution` | Data source credit |

## Example Automation

```yaml
automation:
  - alias: "Announce Time in Multiple Cities"
    trigger:
      - platform: time_pattern
        hours: "*"
        minutes: "0"
    action:
      - service: tts.speak
        data:
          message: >
            The time in Bahrain is {{ states('sensor.clock_bh_bahrain_time') }}.
            In New York it's {{ states('sensor.clock_bh_new_york_time') }}.
```

## Supported Timezones

The integration supports all standard IANA timezones (400+), including:

**Common Timezones (highlighted):**
- Asia/Bahrain (default)
- UTC
- America/New_York
- America/Los_Angeles
- Europe/London
- Europe/Paris
- Asia/Dubai
- Asia/Tokyo
- Australia/Sydney

## Links

- [clock.bh](https://clock.bh) - Bahrain NTP Time Server
- [Report Issues](https://github.com/iret33/ha-clock-bh/issues)

## License

MIT License - see [LICENSE](LICENSE) file for details.
