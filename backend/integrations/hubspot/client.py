
import httpx, os

class HubSpotClient:
    BASE_URL = "https://api.hubapi.com"

    def __init__(self, access_token: str):
        self.access_token = access_token

    def _headers(self):
        return {"Authorization": f"Bearer {self.access_token}", "Content-Type": "application/json"}

    async def create_contact(self, email: str, first_name: str, last_name: str):
        url = f"{self.BASE_URL}/crm/v3/objects/contacts"
        payload = {"properties": {"email": email, "firstname": first_name, "lastname": last_name}}
        async with httpx.AsyncClient() as client:
            r = await client.post(url, json=payload, headers=self._headers())
            r.raise_for_status()
            return r.json()
