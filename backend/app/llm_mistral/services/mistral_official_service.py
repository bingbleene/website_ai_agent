"""Official Mistral API service (chat/completions) without downloading models.

Endpoint docs: https://docs.mistral.ai/api/
Requires environment variable: MISTRAL_API_KEY
"""

from typing import List, Dict, Optional
import requests
from loguru import logger
from app.llm_mistral.config_mistral import mistral_config


class MistralOfficialService:
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or mistral_config.mistral_api_key
        # You can choose other models like 'mistral-small-latest' or 'mistral-medium-latest'
        self.model = (
            model or mistral_config.mistral_model
        )  # reuse same field for simplicity
        self.base_url = "https://api.mistral.ai/v1/chat/completions"

    def chat(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> str:
        if not self.api_key:
            raise RuntimeError("Missing MISTRAL_API_KEY for official Mistral service")
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        resp = requests.post(self.base_url, headers=headers, json=payload, timeout=60)
        if resp.status_code != 200:
            logger.error(f"Mistral official API error {resp.status_code}: {resp.text}")
            raise RuntimeError(f"Mistral official API error: {resp.status_code}")
        data = resp.json()
        try:
            content = data["choices"][0]["message"]["content"]
            logger.info(f"✅ Mistral official generated {len(content)} characters")
            return content
        except Exception:
            logger.error(f"Unexpected response: {data}")
            raise RuntimeError("Unexpected structure from Mistral official API")


mistral_official_service = MistralOfficialService()
