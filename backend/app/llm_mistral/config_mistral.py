"""Isolated config for Mistral/HuggingFace usage.

Avoids modifying the main Settings class. Reads from environment (.env loaded elsewhere).
"""

from pydantic import BaseModel
import os


class MistralConfig(BaseModel):
    huggingface_token: str | None = None
    mistral_model: str = "mistralai/mistral-small"
    unsplash_access_key: str | None = None
    mistral_api_key: str | None = None  # Official Mistral API (chat/completions)

    @classmethod
    def load(cls) -> "MistralConfig":
        return cls(
            huggingface_token=os.getenv("HUGGINGFACE_API_TOKEN"),
            mistral_model=os.getenv("MISTRAL_MODEL", "mistralai/mistral-small"),
            unsplash_access_key=os.getenv("UNSPLASH_ACCESS_KEY"),
            mistral_api_key=os.getenv("MISTRAL_API_KEY"),
        )


mistral_config = MistralConfig.load()
