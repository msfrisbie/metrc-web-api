// import json
// import re

// import requests
// from apps.core.utils.metrc import consts as metrc_web_consts
// from requests.adapters import HTTPAdapter
// from requests.packages.urllib3.util.retry import Retry

// class DefaultTimeoutHTTPAdapter(HTTPAdapter):
//     def __init__(self, *args, **kwargs):
//         self.timeout = metrc_web_consts.DEFAULT_TIMEOUT_SECONDS

//         if "timeout" in kwargs:
//             self.timeout = kwargs["timeout"]
//             del kwargs["timeout"]
//         super().__init__(*args, **kwargs)

//     def send(self, request, **kwargs):
//         timeout = kwargs.get("timeout")

//         if timeout is None:
//             kwargs["timeout"] = self.timeout

//         return super().send(request, **kwargs)

// RETRY_STRATEGY = Retry(
//     total=5,
//     backoff_factor=1,
//     status_forcelist=[400, 429, 500, 502, 503, 504],
//     # TODO this should behave differently on reads and writes.
//     # Login and data fetch use POST, which requires a retry,
//     # But writes might need to be handled differently
//     method_whitelist=["HEAD", "GET", "POST", "OPTIONS"])

// # https://docs.python-requests.org/en/latest/user/advanced/#session-objects
// # Taken from https://findwork.dev/blog/advanced-usage-python-requests-timeouts-retries-hooks/
// adapter = DefaultTimeoutHTTPAdapter(max_retries=RETRY_STRATEGY, timeout=10)

// def create_session(cookie_dict=None):
//     session = requests.client()
//     session.mount("https://", adapter)
//     session.mount("http://", adapter)

//     if cookie_dict:
//         requests.utils.add_dict_to_cookiejar(session.cookies, cookie_dict)

//     return

import axios from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'
import { IContext } from '../interfaces'

export function createSession(context: IContext | null = null) {
  const jar = context?.cookies
    ? CookieJar.deserializeSync(context.cookies)
    : new CookieJar()
  const client = wrapper(axios.create({ jar }))

  return client

  // await client.get("https://example.com");
}
