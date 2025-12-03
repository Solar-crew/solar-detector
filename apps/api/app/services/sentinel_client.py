# app/services/sentinel_client.py

from __future__ import annotations

import requests
from typing import Any, Dict, List, Optional, Tuple

from app.core.config import settings


class SentinelClient:
    """
    Minimal client for Copernicus Dataspace (CDSE) / Sentinel-2.

    - Manages access + refresh tokens (handles 401 by refreshing)
    - Exposes helper methods for catalogue search and process calls.
    """

    def __init__(self) -> None:
        self.token_url = settings.CDS_TOKEN_URL
        self.client_id = settings.CDS_CLIENT_ID
        self.username = settings.CDS_USERNAME
        self.password = settings.CDS_PASSWORD

        self.catalog_url = settings.CDS_CATALOG_URL
        self.process_url = settings.CDS_PROCESS_URL

        self._access_token: Optional[str] = None
        self._refresh_token: Optional[str] = None

    # ------------------------ token handling ------------------------ #

    def _login(self) -> None:
        resp = requests.post(
            self.token_url,
            data={
                "client_id": self.client_id,
                "username": self.username,
                "password": self.password,
                "grant_type": "password",
            },
        )
        resp.raise_for_status()
        data = resp.json()
        self._access_token = data["access_token"]
        self._refresh_token = data.get("refresh_token")

    def _refresh(self) -> None:
        if not self._refresh_token:
            # if no refresh token yet, just log in again
            self._login()
            return

        resp = requests.post(
            self.token_url,
            data={
                "client_id": self.client_id,
                "grant_type": "refresh_token",
                "refresh_token": self._refresh_token,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        self._access_token = data["access_token"]
        self._refresh_token = data.get("refresh_token")

    def _auth_headers(self) -> Dict[str, str]:
        if not self._access_token:
            self._login()
        assert self._access_token is not None
        return {"Authorization": f"Bearer {self._access_token}"}

    # ------------------------ HTTP helpers ------------------------ #

    def _authorized_get(self, url: str, params: Optional[Dict[str, Any]] = None) -> requests.Response:
        headers = self._auth_headers()
        r = requests.get(url, headers=headers, params=params)

        if r.status_code == 401:
            self._refresh()
            headers = self._auth_headers()
            r = requests.get(url, headers=headers, params=params)

        r.raise_for_status()
        return r

    def _authorized_post(self, url: str, payload: Dict[str, Any]) -> requests.Response:
        headers = self._auth_headers()
        r = requests.post(url, headers=headers, json=payload)

        if r.status_code == 401:
            self._refresh()
            headers = self._auth_headers()
            r = requests.post(url, headers=headers, json=payload)

        r.raise_for_status()
        return r

    # ------------------------ public API ------------------------ #

    def search_s2_products(
        self,
        geometry_wkt: str,
        start_date: str,
        end_date: str,
        max_records: int = 50,
    ) -> List[Dict[str, Any]]:
        """
        Query the Sentinel-2 L2A catalogue for a WKT geometry and time range.
        Returns the list of 'features' from the catalogue JSON.
        """
        params = {
            "startDate": start_date,
            "completionDate": end_date,
            "productType": "S2MSI2A",  # L2A
            "geometry": geometry_wkt,
            "maxRecords": max_records,
        }
        r = self._authorized_get(self.catalog_url, params=params)
        data = r.json()
        return data.get("features", [])

    def process_request(self, payload: Dict[str, Any]) -> bytes:
        """
        Calls the /process endpoint with the given JSON payload and
        returns raw bytes (PNG) as in your Colab script.
        """
        r = self._authorized_post(self.process_url, payload)
        return r.content


# Singleton instance to use from other modules
client = SentinelClient()
