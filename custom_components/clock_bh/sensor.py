"""Sensor platform for Clock.bh - World Time."""
from __future__ import annotations

import logging
from datetime import timedelta, datetime
from typing import Any
from zoneinfo import ZoneInfo

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
    timezone = entry.data.get("timezone", "Asia/Bahrain")
    async_add_entities([ClockBhTimeSensor(hass, entry, timezone)], True)


class ClockBhTimeSensor(SensorEntity):
    """Sensor showing current time from clock.bh in selected timezone."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:clock-outline"

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, timezone: str) -> None:
        """Initialize the sensor."""
        self._hass = hass
        self._entry = entry
        self._timezone = timezone
        self._tz_info = ZoneInfo(timezone)

        # Create a friendly name from timezone
        tz_name = timezone.replace("_", " ").split("/")[-1]
        self._attr_name = f"{tz_name} Time"

        self._attr_unique_id = f"{entry.entry_id}_{timezone}_time"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry.entry_id)},
            "name": f"Clock.bh - {timezone}",
            "manufacturer": "clock.bh",
            "model": "World Time (via Bahrain NTP)",
            "configuration_url": "https://clock.bh",
        }

    async def async_update(self) -> None:
        """Fetch the latest time from clock.bh and convert to selected timezone."""
        try:
            session = async_get_clientsession(self._hass)
            async with session.get(API_URL, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    data = await response.json()
                    # API returns UTC timestamp, convert to datetime
                    if "timestamp" in data:
                        timestamp = data["timestamp"]
                        utc_time = dt_util.utc_from_timestamp(timestamp)
                    elif "time" in data:
                        utc_time = dt_util.parse_datetime(data["time"])
                    else:
                        utc_time = dt_util.utcnow()

                    # Convert to selected timezone
                    if utc_time:
                        local_time = utc_time.astimezone(self._tz_info)
                        self._attr_native_value = local_time.strftime("%H:%M:%S")
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
        try:
            now = datetime.now(self._tz_info)
            utc_offset = now.strftime("%z")
            utc_offset_formatted = f"{utc_offset[:3]}:{utc_offset[3:]}"
        except Exception:
            utc_offset_formatted = "Unknown"

        return {
            "source": "clock.bh",
            "timezone": self._timezone,
            "utc_offset": utc_offset_formatted,
            "attribution": "Time data provided by clock.bh - Bahrain NTP Time Server",
        }
