import { AxiosInstance } from 'axios'
import {
  API_FLOWERING_PLANTS_PATH,
  API_VERIFICATION_TOKEN_REGEX,
  CSRF_KEY,
  CSRF_REGEX,
  LICENSE_REGEX,
  LOGIN_PATH,
  LOGIN_QUERY_STRING,
  LOGOUT_PATH,
  PROTOCOL,
} from './consts'
import { IContext } from './interfaces'
import { createSession } from './utils/http'
import {
  extractEmailFromUserProfileOrError,
  extractLicenseNumbersFromHtmlOrError,
  extractOrError,
} from './utils/text-extract'

export class SerializableSession {
  context: IContext
  client: AxiosInstance

  constructor(context: IContext = {}) {
    this.context = context

    this.client = createSession(context)
  }

  resetSession() {
    this.context = {
      hostname: this.context.hostname,
    }

    this.client = createSession(this.context)
  }

  serializedContext() {}

  set cookies(value: any) {
    this.context.cookies = value
  }

  get hostname() {
    if (!this.context.hostname) {
      throw new Error('hostname is not set')
    }

    return this.context.hostname
  }

  set hostname(value: string | null) {
    this.context.hostname = value
  }

  get licenseNumber() {
    if (!this.context.licenseNumber) {
      throw new Error('licenseNumber is not set')
    }

    return this.context.licenseNumber
  }

  set licenseNumber(value: string | null) {
    this.context.licenseNumber = value
  }

  get apiVerificationToken() {
    if (!this.context.apiVerificationToken) {
      throw new Error('apiVerificationToken is not set')
    }

    return this.context.apiVerificationToken
  }

  set apiVerificationToken(value: string | null) {
    this.context.apiVerificationToken = value
  }

  setLoginTime() {
    this.context.loginTime = Date.now().toString()
  }

  async fetchDefault() {
    // Metrc redirects / to a valid licensed page.
    // This should be used as a safe default path when
    // authenticated.
    const response_1 = await this.client.get(this.rootUrl(), {
      headers: this.getHeadersFactory(),
    })

    return response_1
  }

  origin() {
    return PROTOCOL + this.hostname
  }
  rootUrl() {
    return this.origin()
  }

  loginUrl(includeQueryString = true) {
    return (
      this.origin() +
      LOGIN_PATH +
      (includeQueryString ? LOGIN_QUERY_STRING : '')
    )
  }

  logoutUrl() {
    return this.origin() + LOGOUT_PATH
  }

  apiKeysUrl() {
    return `${this.origin()}/user/apikeys?licenseNumber=${this.licenseNumber}`
  }

  userProfileUrl() {
    return `${this.origin()}/user/profile?licenseNumber=${this.licenseNumber}`
  }

  noopUrl() {
    return `${this.origin()}/api/system/noop`
  }

  getApiFloweringPlantsUrl() {
    return this.origin() + API_FLOWERING_PLANTS_PATH
  }

  sharedHeadersFactory() {
    return {
      Host: this.hostname,
      Connection: 'keep-alive',
      'sec-ch-ua':
        '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
      'sec-ch-ua-mobile': '?0',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8',
    }
  }

  getHeadersFactory() {
    return {
      ...this.sharedHeadersFactory(),
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'none',
    }
  }

  loginHeadersFactory() {
    return {
      ...this.sharedHeadersFactory(),
      Origin: this.origin(),
      'Upgrade-Insecure-Requests': '1',
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      Referer: this.loginUrl(),
    }
  }

  apiHeadersFactory() {
    return {
      ApiVerificationToken: this.apiVerificationToken,
      'X-Metrc-LicenseNumber': this.licenseNumber,
      'X-Requested-With': 'XMLHttpRequest',
    }
  }

  jsonHeadersFactory() {
    return {
      ...this.sharedHeadersFactory(),
      ...this.apiHeadersFactory(),
      'Content-Type': 'application/json',
      Accept: 'application/json, text/javascript, */*; q=0.01',
    }
  }

  async loginOrError(metrcUsername: string, metrcPassword: string) {
    if (metrcUsername.length == 0) {
      throw new Error('metrcUsername is empty')
    }
    if (metrcPassword.length == 0) {
      throw new Error('metrcPassword is empty')
    }

    let loginErrorData

    // The login endpoint is unreliable. Try a login up to 5 times.
    // The error captured at the end will only represent the last failure
    for (let x = 0; x < 5; ++x) {
      console.log(`Login attempt ${x + 1} of 5`)

      loginErrorData = null

      this.resetSession()

      let response1

      // Metrc seems to be unable to recover from an expired session plus
      // visiting the login url. First access the root page, then navigate to
      // login after that
      try {
        response1 = await this.client.get(this.rootUrl(), {
          headers: this.getHeadersFactory(),
        })
      } catch (e) {
        loginErrorData = {
          error: e,
          message: 'Unable to login to Metrc (E.01)',
        }
        continue
      }

      // Re-attempting login means refetching the page for a new token
      try {
        response1 = await this.client.get(this.loginUrl(false), {
          headers: this.getHeadersFactory(),
        })
      } catch (e) {
        loginErrorData = {
          error: e,
          message: 'Unable to login to Metrc (E.02)',
        }
        continue
      }

      let csrfToken

      try {
        csrfToken = extractOrError(CSRF_REGEX, response1.data)
      } catch (e) {
        loginErrorData = {
          error: e,
          message: 'Unable to login to Metrc (E.03)',
        }
        continue
      }

      const formData = new FormData()

      formData.append(CSRF_KEY, csrfToken)
      formData.append('Username', metrcUsername)
      formData.append('Password', metrcPassword)

      let response2

      try {
        // This will perform redirect on success
        response2 = await this.client.post(this.loginUrl(), formData, {
          headers: this.loginHeadersFactory(),
        })
      } catch (e) {
        loginErrorData = {
          error: e,
          message: 'Unable to login to Metrc (E.04)',
        }
        continue
      }

      try {
        this.updateSessionContextFacilityDataOrError(response2.data)

        // Login was successful, exit the loop
        break
      } catch (e) {
        // TODO service may be down, or password may be incorrect
        loginErrorData = {
          error: e,
          message:
            'Unable to login to Metrc, check your username/password (E.05)',
        }
        // time.sleep(1)
        continue
      }
    }

    if (loginErrorData != null) {
      console.error(
        `"${loginErrorData['error']} - ${loginErrorData['message']}"`
      )
      throw new Error(loginErrorData['message'])
    }

    this.setLoginTime()

    console.log('Successful login')
  }

  async logout() {
    const response1 = await this.client.get(this.logoutUrl(), {
      headers: this.getHeadersFactory(),
    })

    this.cookies = {}
    this.apiVerificationToken = null
    this.licenseNumber = null

    return response1
  }

  // Performs a network-minimal login check
  // If the tokens are not present, do not hit the network and return False
  // If the tokens are present, verify they are valid with a noop()
  async isLoggedIn() {
    try {
      this.apiVerificationToken
      this.licenseNumber
    } catch (e) {
      return false
    }

    // Two ways of determining this:
    // - noop returns 200/401
    // - default path redirects to /log-in
    return (await this.noop()).status == 200
  }

  // @requireCredentials
  fetchUserProfile() {
    const response1 = this.client.get(this.userProfileUrl(), {
      headers: this.getHeadersFactory(),
    })

    return response1
  }

  // @requireCredentials
  async noop() {
    const response1 = await this.client.post(this.noopUrl(), {
      headers: this.apiHeadersFactory(),
    })

    return response1
  }

  // @requireCredentials
  async getUserEmailOrError() {
    const userProfileHtml = await this.fetchUserProfile()

    return extractEmailFromUserProfileOrError(userProfileHtml.data)
  }

  // Current license and associated token are derived from the HTML
  updateSessionContextFacilityDataOrError(html: string) {
    const licenseNumber = extractOrError(LICENSE_REGEX, html)

    const apiVerificationToken = extractOrError(
      API_VERIFICATION_TOKEN_REGEX,
      html
    )

    if (!apiVerificationToken) {
      throw new Error('Unable to extract apiVerificationToken')
    }

    this.licenseNumber = licenseNumber
    this.apiVerificationToken = apiVerificationToken
  }

  async getUserFacilitiesOrError() {
    // this.requireCredentialsOrError();

    const defaultHtml = await this.fetchDefault()

    return extractLicenseNumbersFromHtmlOrError(defaultHtml.data)
  }
}
