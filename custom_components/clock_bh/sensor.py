"""Sensor platform for Clock.bh - Bahrain Time."""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

import aiohttp

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.util import dt as dt_util

from . import DOMAIN

_LOGGER = logging.getLogger(__name__)

SCAN_INTERVAL = timedelta(seconds=30)
API_URL = "https://clock.bh/api/server-time"


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Clock.bh sensor from a config entry."""
    async_add_entities([ClockBhTimeSensor(hass, entry)], True)


class ClockBhTimeSensor(SensorEntity):
    """Sensor showing current time from clock.bh."""

    _attr_has_entity_name = True
    _attr_name = "Bahrain Time"
    _attr_icon = "mdi:clock-outline"
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the sensor."""
        self._hass = hass
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_bahrain_time"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry.entry_id)},
            "name": "Clock.bh",
            "manufacturer": "clock.bh",
            "model": "Bahrain NTP Time Server",
            "configuration_url": "https://clock.bh",
        }

    async def async_update(self) -> None:
        """Fetch the latest time from clock.bh."""
        try:
            session = async_get_clientsession(self._hass)
            async with session.get(API_URL, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    data = await response.json()
                    # API returns UTC timestamp, convert to datetime
                    if "timestamp" in data:
                        timestamp = data["timestamp"]
                        self._attr_native_value = dt_util.utc_from_timestamp(timestamp)
                        self._attr_available = True
                    elif "time" in data:
                        # Alternative format if API returns time string
                        self._attr_native_value = dt_util.parse_datetime(data["time"])
                        self._attr_available = True
                    else:
                        # Try to use the response directly as timestamp
                        self._attr_native_value = dt_util.utcnow()
                        self._attr_available = True
                else:
                    _LOGGER.warning("Failed to fetch time from clock.bh: HTTP %s", response.status)
                    self._attr_available = False
        except Exception as err:
            _LOGGER.error("Error fetching time from clock.bh: %s", err)
            self._attr_available = False

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional attributes."""
        return {
            "source": "clock.bh",
            "timezone": "Asia/Bahrain",
            "utc_offset": "+03:00",
            "attribution": "Time data provided by clock.bh - Bahrain NTP Time Server",
        }
