from typing import Literal, Optional, get_origin

from pydantic import BaseModel, ConfigDict, Field

YesNo = Literal["Yes", "No"]
PhoneLines = Literal["Yes", "No", "No phone service"]
InternetAddon = Literal["Yes", "No", "No internet service"]


class CustomerInput(BaseModel):
    """Raw customer attributes, as they appear in the Telco dataset."""

    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "gender": "Female", "SeniorCitizen": 0, "Partner": "No", "Dependents": "No",
                "tenure": 3, "PhoneService": "Yes", "MultipleLines": "No",
                "InternetService": "Fiber optic", "OnlineSecurity": "No", "OnlineBackup": "No",
                "DeviceProtection": "No", "TechSupport": "No", "StreamingTV": "No",
                "StreamingMovies": "No", "Contract": "Month-to-month", "PaperlessBilling": "Yes",
                "PaymentMethod": "Electronic check", "MonthlyCharges": 75.0,
            }
        },
    )

    gender: Literal["Male", "Female"]
    SeniorCitizen: Literal[0, 1]
    Partner: YesNo
    Dependents: YesNo
    tenure: int = Field(ge=0, le=72, description="Months as a customer")
    PhoneService: YesNo
    MultipleLines: PhoneLines
    InternetService: Literal["DSL", "Fiber optic", "No"]
    OnlineSecurity: InternetAddon
    OnlineBackup: InternetAddon
    DeviceProtection: InternetAddon
    TechSupport: InternetAddon
    StreamingTV: InternetAddon
    StreamingMovies: InternetAddon
    Contract: Literal["Month-to-month", "One year", "Two year"]
    PaperlessBilling: YesNo
    PaymentMethod: Literal[
        "Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"
    ]
    MonthlyCharges: float = Field(ge=0, le=500)
    TotalCharges: Optional[float] = Field(
        default=None, ge=0, description="Optional. Defaults to tenure x MonthlyCharges."
    )


def field_options() -> dict:
    """Allowed values for every dropdown-style field (used by the frontend)."""
    options = {}
    for name, field in CustomerInput.model_fields.items():
        if get_origin(field.annotation) is Literal:
            options[name] = list(field.annotation.__args__)
    return options