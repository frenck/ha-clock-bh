"""Clock.bh - Bahrain NTP Time Server integration for Home Assistant."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

_LOGGER = logging.getLogger(__name__)

DOMAIN = "clock_bh"
PLATFORMS = [Platform.SENSOR]

# Frontend card URL
CARD_URL = "/clock_bh/clock-bh-card.js"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Clock.bh from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data

    # Register the frontend card
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

    # Add as a Lovelace resource
    _LOGGER.info("Registering Clock.bh card frontend resource")

    # Try to add to resources if lovelace resources are available
    try:
        resources = hass.data.get("lovelace", {}).get("resources")
        if resources and isinstance(resources, ResourceStorageCollection):
            # Check if already registered
            existing = [r for r in resources.async_items() if CARD_URL in r.get("url", "")]
            if not existing:
                await resources.async_create_item({
                    "res_type": "module",
                    "url": CARD_URL,
                })
                _LOGGER.info("Clock.bh card resource registered successfully")
    except Exception as err:
        _LOGGER.debug("Could not auto-register resource (manual registration may be needed): %s", err)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok
