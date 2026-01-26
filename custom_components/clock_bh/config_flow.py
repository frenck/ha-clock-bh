"""Config flow for Clock.bh integration."""
from __future__ import annotations

import logging
from typing import Any
from zoneinfo import available_timezones

import aiohttp
import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)

from . import DOMAIN

_LOGGER = logging.getLogger(__name__)

API_URL = "https://clock.bh/api/server-time"

# Get all available timezones sorted alphabetically
TIMEZONES = sorted(available_timezones())

# Common timezones to show at the top
COMMON_TIMEZONES = [
    "Asia/Bahrain",
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Dubai",
    "Asia/Tokyo",
    "Australia/Sydney",
]


async def validate_connection(hass: HomeAssistant) -> bool:
    """Validate that we can connect to clock.bh."""
    try:
        session = async_get_clientsession(hass)
        async with session.get(API_URL, timeout=aiohttp.ClientTimeout(total=10)) as response:
            return response.status == 200
    except Exception:
        return False


class ClockBhConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Clock.bh."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            timezone = user_input.get("timezone", "Asia/Bahrain")

            # Check if this timezone is already configured
            await self.async_set_unique_id(f"{DOMAIN}_{timezone}")
            self._abort_if_unique_id_configured()

            # Validate connection to clock.bh
            if await validate_connection(self.hass):
                return self.async_create_entry(
                    title=f"Clock.bh - {timezone}",
                    data={"timezone": timezone},
                )
            errors["base"] = "cannot_connect"

        # Build timezone options with common ones first
        timezone_options = []
        for tz in COMMON_TIMEZONES:
            if tz in TIMEZONES:
                timezone_options.append({"value": tz, "label": f"⭐ {tz}"})

        for tz in TIMEZONES:
            if tz not in COMMON_TIMEZONES:
                timezone_options.append({"value": tz, "label": tz})

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required("timezone", default="Asia/Bahrain"): SelectSelector(
                    SelectSelectorConfig(
                        options=timezone_options,
                        mode=SelectSelectorMode.DROPDOWN,
                        sort=False,
                    )
                ),
            }),
            errors=errors,
            description_placeholders={
                "url": "https://clock.bh",
            },
        )
