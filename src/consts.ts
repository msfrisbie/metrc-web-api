export const COLLECTION_JOB_CHUNK_SIZE = 100;
export const DEFAULT_TIMEOUT_SECONDS = 10;

export const PROTOCOL = "https://";

export const CSRF_KEY = `__RequestVerificationToken`;
export const CSRF_REGEX = `${CSRF_KEY}.*value="([^"]*)"`;
export const LICENSE_REGEX = `'X-Metrc-LicenseNumber': '([^']+)'`;
export const API_VERIFICATION_TOKEN_REGEX = `'ApiVerificationToken': '([^']+)'`;
export const API_KEY_REGEX = `value="([^"]{36,})"`;
export const USER_PROFILE_EMAIL_REGEX = `input.*id="email".*value="([^"]+)"`;
export const USER_PROFILE_PHONE_REGEX = `input.*PhoneNumber.*value="([^"]+)"`;
export const USER_PROFILE_NAME_REGEX = `Full Name.*\n.*<dd>(.*)</dd>`;
export const USER_PROFILE_USERNAME_REGEX = `Username.*\n.*<dd>(.*)</dd>`;

export const LOGIN_PATH = "/log-in";
export const LOGOUT_PATH = "/log-out";
export const LOGIN_QUERY_STRING = "?ReturnUrl=%2f";
export const GENERATE_API_KEY_URL = "/api/users/apikeys/generate";

export const API_ACTIVE_PLANT_BATCHES_PATH = "/api/plantbatches";
export const API_INACTIVE_PLANT_BATCHES_PATH = "/api/plantbatches/inactive";

export const API_INACTIVE_PLANTS_PATH = "/api/plants/inactive";
export const API_VEGETATIVE_PLANTS_PATH = "/api/plants/vegetative";
export const API_FLOWERING_PLANTS_PATH = "/api/plants/flowering";

export const API_ACTIVE_PACKAGES_PATH = "/api/packages";
export const API_ON_HOLD_PACKAGES_PATH = "/api/packages/onhold";
export const API_INACTIVE_PACKAGES_PATH = "/api/packages/inactive";
export const API_IN_TRANSIT_PACKAGES_PATH = "/api/packages/intransit";

export const API_ACTIVE_HARVESTS_PATH = "/api/harvests";
export const API_INACTIVE_HARVESTS_PATH = "/api/harvests/inactive";
export const API_HARVEST_HISTORY_PATH = "/api/harvests/history";
export const API_HARVEST_PACKAGES_PATH = "/api/harvests/packages";

export const API_ACTIVE_SALES_PATH = "/api/sales/receipts/active";

export const API_INCOMING_TRANSFERS_PATH =
  "/api/transfers/incoming?slt=Licensed";
export const API_OUTGOING_TRANSFERS_PATH =
  "/api/transfers/outgoing?slt=Licensed";
export const API_REJECTED_TRANSFERS_PATH = "/api/transfers/rejected";
export const API_TRANSFER_DESTINATIONS_PATH = "/api/transfers/destinations";
export const API_TRANSFER_TRANSPORTERS_PATH =
  "/api/transfers/destinations/transporters";
export const API_TRANSFER_PACKAGES_PATH =
  "/api/transfers/destinations/packages";
