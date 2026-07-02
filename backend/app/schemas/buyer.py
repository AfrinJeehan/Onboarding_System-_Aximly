from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


class BuyerBaseFields(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    company_name: str = Field(min_length=1, max_length=150)
    business_type: str = Field(min_length=1, max_length=100)
    address: str = Field(min_length=1, max_length=255)
    onboarding_goal: str = Field(min_length=10, max_length=1000)

    @field_validator("name", "company_name", "business_type", "address", "onboarding_goal")
    @classmethod
    def strip_required_strings(cls, value: str) -> str:
        normalized_value = value.strip()
        if not normalized_value:
            raise ValueError("This field is required.")
        return normalized_value

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, value: str | None) -> str | None:
        if value is None:
            return None

        normalized_value = value.strip()
        return normalized_value or None


class BuyerCreate(BuyerBaseFields):
    password: str = Field(min_length=8, max_length=128)
    retype_password: str = Field(min_length=8, max_length=128)

    @model_validator(mode="after")
    def validate_password_match(self) -> "BuyerCreate":
        if self.password != self.retype_password:
            raise ValueError("Passwords do not match.")
        return self


class BuyerLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class BuyerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=20)
    company_name: str | None = Field(default=None, min_length=1, max_length=150)
    business_type: str | None = Field(default=None, min_length=1, max_length=100)
    address: str | None = Field(default=None, min_length=1, max_length=255)
    onboarding_goal: str | None = Field(default=None, min_length=10, max_length=1000)
    status: str | None = Field(default=None, max_length=20)
    notification: str | None = Field(default=None, max_length=1000)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str | None) -> str | None:
        if value is None:
            return None

        normalized_value = value.strip()
        if not normalized_value:
            raise ValueError("Name cannot be blank.")
        return normalized_value

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, value: str | None) -> str | None:
        if value is None:
            return None

        normalized_value = value.strip()
        return normalized_value or None

    @field_validator("company_name", "business_type", "address", "onboarding_goal", "notification")
    @classmethod
    def normalize_optional_strings(cls, value: str | None) -> str | None:
        if value is None:
            return None

        normalized_value = value.strip()
        return normalized_value or None

    @field_validator("status")
    @classmethod
    def normalize_status(cls, value: str | None) -> str | None:
        if value is None:
            return None

        normalized_value = value.strip()
        if not normalized_value:
            raise ValueError("Status cannot be blank.")
        return normalized_value


class BuyerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: str | None
    company_name: str | None
    business_type: str | None
    address: str | None
    onboarding_goal: str | None
    status: str
    notification: str | None
    created_at: datetime
