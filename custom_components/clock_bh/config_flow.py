"""Config flow for Clock.bh integration."""
from __future__ import annotations

import logging
from typing import Any

import aiohttp
import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from . import DOMAIN

_LOGGER = logging.getLogger(__name__)

API_URL = "https://clock.bh/api/server-time"


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

        # Check if already configured
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            # Validate connection to clock.bh
            if await validate_connection(self.hass):
                return self.async_create_entry(
                    title="Clock.bh - Bahrain Time",
                    data={},
                )
            errors["base"] = "cannot_connect"

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({}),
            errors=errors,
            description_placeholders={
                "url": "https://clock.bh",
            },
        )
