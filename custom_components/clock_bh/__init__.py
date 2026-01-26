"""Clock.bh - Bahrain NTP Time Server integration for Home Assistant."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

DOMAIN = "clock_bh"
PLATFORMS = [Platform.SENSOR]

# Frontend card URL
CARD_URL = "/clock_bh/clock-bh-card.js"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Clock.bh from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data

    # Register the frontend card static path
    await _async_register_frontend(hass)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def _async_register_frontend(hass: HomeAssistant) -> None:
    """Register the frontend card resources."""
    # Only register once
    if f"{DOMAIN}_frontend_registered" in hass.data:
        return

    hass.data[f"{DOMAIN}_frontend_registered"] = True

    # Register the static path for serving the JS file
    hass.http.register_static_path(
        CARD_URL,
        str(Path(__file__).parent / "www" / "clock-bh-card.js"),
        cache_headers=False,
    )

    _LOGGER.info(
        "Clock.bh card registered at %s - Add this as a Lovelace resource if not auto-detected",
        CARD_URL
    )


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok
