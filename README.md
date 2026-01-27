# Clock.bh - World Time for Home Assistant

[![GitHub Release](https://img.shields.io/github/v/release/iret33/ha-clock-bh?style=flat-square)](https://github.com/iret33/ha-clock-bh/releases)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/iret33/ha-clock-bh/validate.yml?style=flat-square&label=validate)](https://github.com/iret33/ha-clock-bh/actions/workflows/validate.yml)
[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg?style=flat-square)](https://github.com/hacs/integration)
[![License](https://img.shields.io/github/license/iret33/ha-clock-bh?style=flat-square)](LICENSE)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.1.0+-blue?style=flat-square)](https://www.home-assistant.io/)
[![GitHub Stars](https://img.shields.io/github/stars/iret33/ha-clock-bh?style=flat-square)](https://github.com/iret33/ha-clock-bh/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/iret33/ha-clock-bh?style=flat-square)](https://github.com/iret33/ha-clock-bh/issues)
[![Maintenance](https://img.shields.io/maintenance/yes/2026?style=flat-square)](https://github.com/iret33/ha-clock-bh)

A Home Assistant custom integration that provides accurate world time from [clock.bh](https://clock.bh) - the official Bahrain NTP Time Server. Includes a beautiful animated Lovelace card matching the clock.bh design.

## Features

- **Animated Lovelace Card** - Beautiful SVG clock matching clock.bh design
- **Any Timezone Support** - Select from 400+ timezones worldwide
- **Multiple Instances** - Add multiple clocks for different timezones
- Synced with atomic clocks via clock.bh NTP server
- Bahrain flag colors (Red & Gold)
- Day/night indicator
- Light/dark theme support

## Lovelace Card

The integration includes a custom animated clock card with smooth second-hand movement, matching the clock.bh logo design.

### Card Preview

The card features:
- Smooth animated clock hands (hour, minute, second)
- Bahrain-inspired colors (#CE1126 red, #C9A66B gold)
- Digital time display
- Date display
- Day/night indicator
- UTC offset badge
- Light/dark theme auto-detection

### Card Configuration

```yaml
type: custom:clock-bh-card
timezone: Asia/Bahrain
title: Bahrain
show_date: true
show_seconds: true
theme: auto  # 'light', 'dark', or 'auto'
size: medium  # 'small', 'medium', or 'large'
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timezone` | string | `Asia/Bahrain` | IANA timezone identifier |
| `title` | string | Auto from timezone | Custom title for the clock |
| `show_date` | boolean | `true` | Show current date |
| `show_seconds` | boolean | `true` | Show second hand and seconds in digital display |
| `theme` | string | `auto` | Color theme: `light`, `dark`, or `auto` |
| `size` | string | `medium` | Card size: `small`, `medium`, or `large` |

### Multiple Clocks Example

```yaml
type: horizontal-stack
cards:
  - type: custom:clock-bh-card
    timezone: America/New_York
    title: New York
    size: small
  - type: custom:clock-bh-card
    timezone: Europe/London
    title: London
    size: small
  - type: custom:clock-bh-card
    timezone: Asia/Bahrain
    title: Bahrain
    size: small
  - type: custom:clock-bh-card
    timezone: Asia/Tokyo
    title: Tokyo
    size: small
```

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
4. Add the card resource manually if needed:
   - Go to Settings > Dashboards > Resources
   - Add `/clock_bh/clock-bh-card.js` as JavaScript Module

## Sensor Configuration

1. Go to **Settings** > **Devices & Services**
2. Click **+ Add Integration**
3. Search for "Clock.bh"
4. Select your desired timezone from the dropdown
5. Click Submit

You can add multiple instances for different timezones!

## About clock.bh

[clock.bh](https://clock.bh) is a free, public NTP (Network Time Protocol) server for the Kingdom of Bahrain, offering accurate time synchronization for servers, computers, and IoT devices in the Middle East region.

## Links

- [clock.bh](https://clock.bh) - Bahrain NTP Time Server
- [Report Issues](https://github.com/iret33/ha-clock-bh/issues)

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

Powered by [clock.bh](https://clock.bh) - Bahrain NTP Time Server
