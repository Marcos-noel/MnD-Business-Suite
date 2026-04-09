from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text, Float, Integer, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.models.base import TenantScopedBase


class JournalEntry(TenantScopedBase):
    """General ledger journal entry"""
    __tablename__ = "accounting_journal_entries"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    
    entry_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    description: Mapped[str] = mapped_column(String(255), default="")
    
    reference_type: Mapped[str] = mapped_column(String(50), default="")  # invoice, bill, etc.
    reference_id: Mapped[str] = mapped_column(String(36), default="")
    
    debit_account: Mapped[str] = mapped_column(String(100))  # Account code
    credit_account: Mapped[str] = mapped_column(String(100))  # Account code
    
    amount: Mapped[float] = mapped_column(Float, default=0)
    currency: Mapped[str] = mapped_column(String(3), default="KES")
    exchange_rate: Mapped[float] = mapped_column(Float, default=1.0)
    
    posted: Mapped[bool] = mapped_column(default=False)
    posted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    notes: Mapped[str] = mapped_column(Text, default="")


class ChartOfAccounts(TenantScopedBase):
    """Chart of accounts for the organization"""
    __tablename__ = "accounting_chart_of_accounts"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    
    account_code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    account_name: Mapped[str] = mapped_column(String(255))
    account_type: Mapped[str] = mapped_column(String(50))  # ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    
    description: Mapped[str] = mapped_column(Text, default="")
    is_active: Mapped[bool] = mapped_column(default=True)


class ExchangeRate(TenantScopedBase):
    """Daily exchange rates"""
    __tablename__ = "accounting_exchange_rates"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    
    rate_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    
    from_currency: Mapped[str] = mapped_column(String(3))  # KES
    to_currency: Mapped[str] = mapped_column(String(3))  # USD, EUR, etc.
    
    rate: Mapped[float] = mapped_column(Float)  # 1 from_currency = X to_currency
    source: Mapped[str] = mapped_column(String(100), default="manual")  # manual, api, etc.


class BankAccount(TenantScopedBase):
    """Organization bank accounts"""
    __tablename__ = "accounting_bank_accounts"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    
    account_name: Mapped[str] = mapped_column(String(255))
    account_number: Mapped[str] = mapped_column(String(100))
    bank_name: Mapped[str] = mapped_column(String(255))
    currency: Mapped[str] = mapped_column(String(3))
    
    starting_balance: Mapped[float] = mapped_column(Float, default=0)
    current_balance: Mapped[float] = mapped_column(Float, default=0)
    
    account_type: Mapped[str] = mapped_column(String(50), default="operating")  # operating, savings, credit
    is_active: Mapped[bool] = mapped_column(default=True)


class PaymentTerm(TenantScopedBase):
    """Payment terms definition"""
    __tablename__ = "accounting_payment_terms"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    
    term_code: Mapped[str] = mapped_column(String(50), unique=True)  # FOB, CIF, NET30, etc.
    term_name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    
    days_until_due: Mapped[int] = mapped_column(Integer, default=0)
    discount_percentage: Mapped[float] = mapped_column(Float, default=0)
    discount_days: Mapped[int] = mapped_column(Integer, default=0)


class PaymentRecord(TenantScopedBase):
    """Payment received or made"""
    __tablename__ = "accounting_payment_records"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    
    invoice_id: Mapped[str | None] = mapped_column(String(36), nullable=True)  # Related invoice
    reference_no: Mapped[str] = mapped_column(String(100), index=True)
    
    payment_type: Mapped[str] = mapped_column(String(50), default="received")  # received, made
    payment_method: Mapped[str] = mapped_column(String(50))  # bank_transfer, cash, check, online, etc.
    
    amount: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(3))
    exchange_rate: Mapped[float] = mapped_column(Float, default=1.0)
    
    payment_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    received_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    notes: Mapped[str] = mapped_column(Text, default="")
