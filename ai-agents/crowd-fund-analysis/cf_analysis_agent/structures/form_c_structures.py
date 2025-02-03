from typing import Optional, List, Dict, Literal
from pydantic import BaseModel, Field

class FinancialMetric(BaseModel):
    most_recent: float = Field(description="Value of the metric for the most recent fiscal year.")
    prior: float = Field(description="Value of the metric for the prior fiscal year.")

class Financials(BaseModel):
    total_assets: FinancialMetric = Field(description="Total assets for the most recent and prior fiscal years.")
    cash_and_equivalents: FinancialMetric = Field(description="Cash and cash equivalents for the most recent and prior fiscal years.")
    accounts_receivable: FinancialMetric = Field(description="Accounts receivable for the most recent and prior fiscal years.")
    short_term_debt: FinancialMetric = Field(description="Short-term debt for the most recent and prior fiscal years.")
    long_term_debt: FinancialMetric = Field(description="Long-term debt for the most recent and prior fiscal years.")
    revenue: FinancialMetric = Field(description="Revenue for the most recent and prior fiscal years.")
    cost_of_goods_sold: FinancialMetric = Field(description="Cost of goods sold for the most recent and prior fiscal years.")
    taxes_paid: FinancialMetric = Field(description="Taxes paid for the most recent and prior fiscal years.")
    net_income: FinancialMetric = Field(description="Net income for the most recent and prior fiscal years.")

class Address(BaseModel):
    address_1: str = Field(description="Primary address line of the issuer.")
    address_2: Optional[str] = Field(description="Secondary address line of the issuer.")
    city: str = Field(description="City of the issuer.")
    state_country: str = Field(description="State or country of incorporation.")
    postal_code: str = Field(description="Postal code of the issuer's address.")

class IssuerInfo(BaseModel):
    name: str = Field(description="Name of the issuer.")
    form: str = Field(description="Legal form of the issuer (e.g., Corporation, LLC, etc.).")
    jurisdiction: str = Field(description="Jurisdiction of incorporation or organization.")
    incorporation_date: str = Field(description="Date of incorporation or organization.")
    physical_address: Address = Field(description="Physical address of the issuer.")
    website: str = Field(description="Website URL of the issuer.")
    is_co_issuer: bool = Field(description="Indicates if there is a co-issuer.")
    co_issuer: Optional[str] = Field(description="Name of the co-issuer if applicable.")

class CoIssuerInfo(BaseModel):
    name: str = Field(description="Name of the co-issuer.")
    form: str = Field(description="Legal form of the co-issuer.")
    jurisdiction: str = Field(description="Jurisdiction of incorporation or organization.")
    incorporation_date: str = Field(description="Date of incorporation or organization of the co-issuer.")
    physical_address: Address = Field(description="Physical address of the co-issuer.")
    website: str = Field(description="Website URL of the co-issuer.")

class OfferingInfo(BaseModel):
    intermediary_name: str = Field(description="Name of the intermediary conducting the offering.")
    intermediary_cik: str = Field(description="CIK number of the intermediary.")
    commission_file_number: str = Field(description="Commission file number of the intermediary.")
    crd_number: str = Field(description="CRD number of the intermediary.")
    compensation: str = Field(description="Compensation to be paid to the intermediary.")
    intermediary_interest: str = Field(description="Any financial interest of the intermediary in the issuer.")
    security_type: str = Field(description="Type of security being offered.")
    security_specification: str = Field(description="Specific details about the security type.")
    target_number_of_securities: int = Field(description="Target number of securities to be offered.")
    price_per_security: float = Field(description="Price per unit of the security.")
    price_determination_method: str = Field(description="Method used to determine the price of securities.")
    target_offering_amount: float = Field(description="Minimum amount of offering required.")
    max_offering_amount: float = Field(description="Maximum amount of offering allowed.")
    oversubscriptions_accepted: bool = Field(description="Indicates whether oversubscriptions are accepted.")
    oversubscription_allocation: str = Field(description="Method used to allocate oversubscriptions.")
    deadline: str = Field(description="Deadline for reaching the target offering amount.")

class Signature(BaseModel):
    name: str = Field(description="Name of the signatory.")
    title: str = Field(description="Title of the signatory.")
    date: str = Field(description="Date of signing.")

class StructuredFormCResponse(BaseModel):
    filing_status: Literal['LIVE', 'TEST'] = Field(description="Indicates whether the filing is LIVE or TEST.")
    issuer: IssuerInfo = Field(description="Information about the issuer.")
    co_issuer: Optional[CoIssuerInfo] = Field(description="Information about the co-issuer if applicable.")
    offering: OfferingInfo = Field(description="Details of the offering.")
    financials: Financials = Field(description="Financial information of the issuer.")
    jurisdictions_offered: List[str] = Field(description="List of jurisdictions where the securities will be offered.")
    signatures: List[Signature] = Field(description="List of signatures authorizing the Form C filing.")
