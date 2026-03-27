from __future__ import annotations

from abc import ABC, abstractmethod

from app.core.config import restricted_countries
from app.models.export_mgmt.export_order import ExportOrder


class ExportRule(ABC):
    @abstractmethod
    async def validate(self, *, order: ExportOrder) -> list[str]: ...


class RestrictedCountryRule(ExportRule):
    async def validate(self, *, order: ExportOrder) -> list[str]:
        blocked = restricted_countries()
        if not blocked:
            return []
        if order.destination_country.strip().lower() in blocked:
            return [f"Destination country '{order.destination_country}' is restricted."]
        return []


class ExportRulesRegistry:
    def __init__(self) -> None:
        self._rules: list[ExportRule] = []

    def register(self, rule: ExportRule) -> None:
        self._rules.append(rule)

    async def validate(self, *, order: ExportOrder) -> list[str]:
        errors: list[str] = []
        for rule in self._rules:
            errors.extend(await rule.validate(order=order))
        return errors


rules_registry = ExportRulesRegistry()
rules_registry.register(RestrictedCountryRule())

