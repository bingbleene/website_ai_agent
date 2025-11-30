"""Minimal Mistral text generation service via Hugging Face Inference API.

This is intentionally isolated from the existing OpenAI/Gemini code.
"""

from typing import Optional
import requests
from loguru import logger
from app.llm_mistral.config_mistral import mistral_config


class MistralService:
    def __init__(self, model: Optional[str] = None, api_token: Optional[str] = None):
        self.model = model or mistral_config.mistral_model
        self.api_token = api_token or mistral_config.huggingface_token
        self.base_url = f"https://api-inference.huggingface.co/models/{self.model}"

    def generate_text(
        self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7
    ) -> str:
        if not self.api_token:
            raise RuntimeError("Missing HUGGINGFACE_API_TOKEN for Mistral service")
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": int(max_tokens),
                "temperature": float(temperature),
            },
        }
        resp = requests.post(self.base_url, headers=headers, json=payload, timeout=90)
        if resp.status_code != 200:
            logger.error(f"Mistral API error {resp.status_code}: {resp.text}")
            raise RuntimeError(f"Mistral API error: {resp.status_code}")
        data = resp.json()
        # Try common shapes
        if isinstance(data, list) and data and isinstance(data[0], dict):
            txt = data[0].get("generated_text") or data[0].get("text")
            if txt:
                logger.info(f"✅ Mistral generated {len(txt)} characters")
                return txt
        if isinstance(data, dict):
            txt = data.get("generated_text") or data.get("text")
            if txt:
                logger.info(f"✅ Mistral generated {len(txt)} characters")
                return txt
        # Fallback join list items
        if isinstance(data, list):
            parts = []
            for item in data:
                if isinstance(item, dict):
                    parts.append(item.get("generated_text") or item.get("text") or "")
                elif isinstance(item, str):
                    parts.append(item)
            joined = "\n".join([p for p in parts if p])
            if joined:
                logger.info(f"✅ Mistral generated {len(joined)} characters (joined)")
                return joined
        logger.error(f"Unexpected Mistral response: {data}")
        raise RuntimeError("Unexpected response from Mistral API")


mistral_service = MistralService()
