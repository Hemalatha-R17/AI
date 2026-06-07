# Restful-Booker API — Test Cases (Jira Format)

**Project:** Restful-Booker API Testing  
**Base URL:** `https://restful-booker.herokuapp.com`  
**Created By:** QA Team  
**Date:** 2026-06-07  
**Total Test Cases:** 52

---

## Legend

| Field | Description |
|-------|-------------|
| **TC-ID** | Unique test case identifier |
| **Summary** | One-line title of what is being tested |
| **Priority** | Critical / High / Medium / Low |
| **Labels** | Tags for filtering in Jira |
| **Pre-conditions** | State required before running the test |
| **Test Steps** | Step-by-step actions with test data |
| **Expected Result** | What should happen |
| **Status** | Not Executed / Pass / Fail |

---

---

# SECTION 1 — AUTH (POST /auth)

---

## TC-AUTH-001

| Field | Details |
|-------|---------|
| **TC-ID** | TC-AUTH-001 |
| **Summary** | Create auth token with valid credentials |
| **Description** | Verify that a valid token is returned when correct username and password are provided |
| **Priority** | Critical |
| **Labels** | API, Auth, Happy-Path, Smoke |
| **Component** | Auth |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable (ping endpoint returns 201)

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST request to `/auth` | `Content-Type: application/json` | Request is sent successfully |
| 2 | Set request body | `{ "username": "admin", "password": "password123" }` | Body is accepted |
| 3 | Verify HTTP status code | — | `200 OK` |
| 4 | Verify response body contains `token` field | — | `token` key is present with a non-empty string value |

**Expected Result:** HTTP 200; response body `{ "token": "<non-empty-string>" }`

---

## TC-AUTH-002

| Field | Details |
|-------|---------|
| **TC-ID** | TC-AUTH-002 |
| **Summary** | Create token with invalid username returns error |
| **Description** | Verify the API returns an error response when an incorrect username is sent |
| **Priority** | High |
| **Labels** | API, Auth, Negative, Error-Scenario |
| **Component** | Auth |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST request to `/auth` | `Content-Type: application/json` | Request is sent |
| 2 | Set request body with wrong username | `{ "username": "wronguser", "password": "password123" }` | Body is accepted |
| 3 | Verify HTTP status code | — | `200 OK` (API returns 200 with error message) |
| 4 | Verify response body | — | `{ "reason": "Bad credentials" }` — no `token` field |

**Expected Result:** HTTP 200; response body `{ "reason": "Bad credentials" }` with no `token` key present

---

## TC-AUTH-003

| Field | Details |
|-------|---------|
| **TC-ID** | TC-AUTH-003 |
| **Summary** | Create token with invalid password returns error |
| **Description** | Verify the API returns an error when the correct username but wrong password is provided |
| **Priority** | High |
| **Labels** | API, Auth, Negative, Error-Scenario |
| **Component** | Auth |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST request to `/auth` | `Content-Type: application/json` | Request is sent |
| 2 | Set request body with wrong password | `{ "username": "admin", "password": "wrongpassword" }` | Body is accepted |
| 3 | Verify HTTP status code | — | `200 OK` |
| 4 | Verify response body | — | `{ "reason": "Bad credentials" }` |

**Expected Result:** HTTP 200; response body `{ "reason": "Bad credentials" }` with no `token` key

---

## TC-AUTH-004

| Field | Details |
|-------|---------|
| **TC-ID** | TC-AUTH-004 |
| **Summary** | Create token with missing username field |
| **Description** | Verify the API handles a request body that omits the `username` field |
| **Priority** | High |
| **Labels** | API, Auth, Negative, Edge-Case |
| **Component** | Auth |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST request to `/auth` | `Content-Type: application/json` | Request is sent |
| 2 | Omit username from body | `{ "password": "password123" }` | Body is accepted |
| 3 | Verify HTTP status code | — | `200 OK` or `400 Bad Request` |
| 4 | Verify response body | — | Error message indicating bad credentials or missing field |

**Expected Result:** API returns an error response — no `token` is issued

---

## TC-AUTH-005

| Field | Details |
|-------|---------|
| **TC-ID** | TC-AUTH-005 |
| **Summary** | Create token with empty request body |
| **Description** | Verify the API handles a completely empty JSON body `{}` |
| **Priority** | Medium |
| **Labels** | API, Auth, Edge-Case |
| **Component** | Auth |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST request to `/auth` | `Content-Type: application/json`, body `{}` | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` or `400 Bad Request` |
| 3 | Verify no token is returned | — | `{ "reason": "Bad credentials" }` or equivalent error |

**Expected Result:** No token is issued; response contains an error indicator

---

## TC-AUTH-006

| Field | Details |
|-------|---------|
| **TC-ID** | TC-AUTH-006 |
| **Summary** | Create token with empty string values for credentials |
| **Description** | Verify the API rejects empty-string username and password |
| **Priority** | Medium |
| **Labels** | API, Auth, Edge-Case |
| **Component** | Auth |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST request to `/auth` | `{ "username": "", "password": "" }` | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` or `400 Bad Request` |
| 3 | Verify no token is returned | — | Error response, no `token` field |

**Expected Result:** No token issued; error response returned

---

---

# SECTION 2 — BOOKING: GetBookingIds (GET /booking)

---

## TC-GBI-001

| Field | Details |
|-------|---------|
| **TC-ID** | TC-GBI-001 |
| **Summary** | Get all booking IDs without filters |
| **Description** | Verify that a GET /booking without query parameters returns all booking IDs |
| **Priority** | Critical |
| **Labels** | API, Booking, Happy-Path, Smoke |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- At least one booking exists in the system

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send GET request to `/booking` | No query parameters | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` |
| 3 | Verify response is a JSON array | — | Array of objects, each containing `bookingid` (number) |
| 4 | Verify array is not empty | — | At least one element present |

**Expected Result:** HTTP 200; `[ { "bookingid": 1 }, { "bookingid": 2 }, ... ]`

---

## TC-GBI-002

| Field | Details |
|-------|---------|
| **TC-ID** | TC-GBI-002 |
| **Summary** | Filter booking IDs by firstname |
| **Description** | Verify that filtering by `firstname` query parameter returns only matching bookings |
| **Priority** | High |
| **Labels** | API, Booking, Happy-Path, Filter |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- A booking with `firstname = "Sally"` exists

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send GET request to `/booking?firstname=Sally` | `firstname=Sally` | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` |
| 3 | Verify response is a JSON array | — | Array of booking IDs |
| 4 | Verify returned bookings match the filter | Fetch each returned ID via GET /booking/:id | Every booking has `firstname = "Sally"` |

**Expected Result:** HTTP 200; array containing only bookings where firstname is "Sally"

---

## TC-GBI-003

| Field | Details |
|-------|---------|
| **TC-ID** | TC-GBI-003 |
| **Summary** | Filter booking IDs by firstname and lastname |
| **Description** | Verify combined firstname + lastname filter returns correctly scoped results |
| **Priority** | High |
| **Labels** | API, Booking, Happy-Path, Filter |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- A booking with `firstname = "Sally"` and `lastname = "Brown"` exists

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send GET `/booking?firstname=Sally&lastname=Brown` | Both query params | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` |
| 3 | Verify response array | — | Contains bookingids matching both name criteria |

**Expected Result:** HTTP 200; array of IDs where every booking has firstname "Sally" AND lastname "Brown"

---

## TC-GBI-004

| Field | Details |
|-------|---------|
| **TC-ID** | TC-GBI-004 |
| **Summary** | Filter booking IDs by checkin date |
| **Description** | Verify that checkin filter returns bookings with checkin >= specified date |
| **Priority** | High |
| **Labels** | API, Booking, Happy-Path, Filter, Date |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Bookings with varying checkin dates exist

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send GET `/booking?checkin=2014-03-13` | `checkin=2014-03-13` (CCYY-MM-DD format) | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` |
| 3 | Verify each returned booking has checkin >= 2014-03-13 | Fetch each booking | All checkin dates >= filter date |

**Expected Result:** HTTP 200; only bookings with `checkin >= 2014-03-13` are returned

---

## TC-GBI-005

| Field | Details |
|-------|---------|
| **TC-ID** | TC-GBI-005 |
| **Summary** | Filter booking IDs by checkout date |
| **Description** | Verify that checkout filter returns bookings with checkout >= specified date |
| **Priority** | High |
| **Labels** | API, Booking, Happy-Path, Filter, Date |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Bookings with varying checkout dates exist

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send GET `/booking?checkout=2014-05-21` | `checkout=2014-05-21` | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` |
| 3 | Verify each returned booking has checkout >= 2014-05-21 | Fetch each booking | All checkout dates >= filter date |

**Expected Result:** HTTP 200; only bookings with `checkout >= 2014-05-21` are returned

---

## TC-GBI-006

| Field | Details |
|-------|---------|
| **TC-ID** | TC-GBI-006 |
| **Summary** | Filter by non-existent firstname returns empty array |
| **Description** | Verify the API returns an empty array when no bookings match the filter |
| **Priority** | Medium |
| **Labels** | API, Booking, Edge-Case, Filter |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- No booking exists with firstname "Zzznonexistent"

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send GET `/booking?firstname=Zzznonexistent` | Non-existent name | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` |
| 3 | Verify response body | — | Empty array `[]` |

**Expected Result:** HTTP 200; response body is `[]`

---

## TC-GBI-007

| Field | Details |
|-------|---------|
| **TC-ID** | TC-GBI-007 |
| **Summary** | Filter by checkin with invalid date format |
| **Description** | Verify the API handles an incorrectly formatted checkin date (not CCYY-MM-DD) |
| **Priority** | Medium |
| **Labels** | API, Booking, Negative, Edge-Case, Date |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send GET `/booking?checkin=13-03-2014` | Invalid date format (DD-MM-YYYY) | Request is sent |
| 2 | Verify response | — | Either `500` error or ignores the filter and returns all records |

**Expected Result:** API either returns an error status or ignores the malformed date — it should NOT silently return incorrect filtered results

---

---

# SECTION 3 — BOOKING: GetBooking (GET /booking/:id)

---

## TC-GB-001

| Field | Details |
|-------|---------|
| **TC-ID** | TC-GB-001 |
| **Summary** | Get a specific booking by valid ID — JSON response |
| **Description** | Verify that a valid booking ID returns full booking details in JSON |
| **Priority** | Critical |
| **Labels** | API, Booking, Happy-Path, Smoke |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Booking with ID 1 exists

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send GET request to `/booking/1` | `Accept: application/json` | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` |
| 3 | Verify response contains all required fields | — | `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates.checkin`, `bookingdates.checkout` all present |
| 4 | Verify field data types | — | `totalprice` is Number, `depositpaid` is Boolean, dates are strings |

**Expected Result:** HTTP 200; complete booking object returned in JSON

---

## TC-GB-002

| Field | Details |
|-------|---------|
| **TC-ID** | TC-GB-002 |
| **Summary** | Get a specific booking by valid ID — XML response |
| **Description** | Verify that setting `Accept: application/xml` returns the booking in XML format |
| **Priority** | Medium |
| **Labels** | API, Booking, Happy-Path, Content-Negotiation |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Booking with ID 1 exists

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send GET `/booking/1` | `Accept: application/xml` | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` |
| 3 | Verify Content-Type of response | — | `application/xml` |
| 4 | Verify XML structure | — | `<booking>` root with `<firstname>`, `<lastname>`, `<totalprice>`, `<depositpaid>`, `<bookingdates>`, `<additionalneeds>` child elements |

**Expected Result:** HTTP 200; valid XML body matching the documented schema

---

## TC-GB-003

| Field | Details |
|-------|---------|
| **TC-ID** | TC-GB-003 |
| **Summary** | Get booking with non-existent ID returns 404 |
| **Description** | Verify the API returns 404 when the booking ID does not exist |
| **Priority** | High |
| **Labels** | API, Booking, Negative, Error-Scenario |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Booking ID 999999 does not exist

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send GET `/booking/999999` | Non-existent ID | Request is sent |
| 2 | Verify HTTP status code | — | `404 Not Found` |
| 3 | Verify response body | — | `"Not Found"` or appropriate error message |

**Expected Result:** HTTP 404; body indicates the booking was not found

---

## TC-GB-004

| Field | Details |
|-------|---------|
| **TC-ID** | TC-GB-004 |
| **Summary** | Get booking with non-numeric ID |
| **Description** | Verify the API handles a non-numeric string as a booking ID |
| **Priority** | Medium |
| **Labels** | API, Booking, Edge-Case, Negative |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send GET `/booking/abc` | Non-numeric ID "abc" | Request is sent |
| 2 | Verify HTTP status code | — | `404 Not Found` or `400 Bad Request` |
| 3 | Verify no booking data is returned | — | Error message body |

**Expected Result:** HTTP 404 or 400; no booking data returned

---

## TC-GB-005

| Field | Details |
|-------|---------|
| **TC-ID** | TC-GB-005 |
| **Summary** | Get booking with negative ID |
| **Description** | Verify the API handles a negative number as booking ID |
| **Priority** | Low |
| **Labels** | API, Booking, Edge-Case |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send GET `/booking/-1` | Negative ID `-1` | Request is sent |
| 2 | Verify HTTP status code | — | `404 Not Found` or `400 Bad Request` |

**Expected Result:** HTTP 404 or 400; no booking data returned

---

---

# SECTION 4 — BOOKING: CreateBooking (POST /booking)

---

## TC-CB-001

| Field | Details |
|-------|---------|
| **TC-ID** | TC-CB-001 |
| **Summary** | Create a new booking with all fields — JSON |
| **Description** | Verify that a full valid payload creates a new booking and returns the booking with an ID |
| **Priority** | Critical |
| **Labels** | API, Booking, Happy-Path, Smoke |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST `/booking` | `Content-Type: application/json`, `Accept: application/json` | Request is sent |
| 2 | Set full valid request body | `{ "firstname": "Jim", "lastname": "Brown", "totalprice": 111, "depositpaid": true, "bookingdates": { "checkin": "2018-01-01", "checkout": "2019-01-01" }, "additionalneeds": "Breakfast" }` | Body accepted |
| 3 | Verify HTTP status code | — | `200 OK` |
| 4 | Verify response contains `bookingid` | — | `bookingid` is a positive integer |
| 5 | Verify response `booking` object matches request payload | — | All fields echoed correctly |

**Expected Result:** HTTP 200; response `{ "bookingid": <number>, "booking": { ...all fields match input... } }`

---

## TC-CB-002

| Field | Details |
|-------|---------|
| **TC-ID** | TC-CB-002 |
| **Summary** | Create a new booking using XML content type |
| **Description** | Verify that a booking can be created using `Content-Type: text/xml` |
| **Priority** | Medium |
| **Labels** | API, Booking, Happy-Path, Content-Type |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST `/booking` | `Content-Type: text/xml`, `Accept: application/xml` | Request is sent |
| 2 | Set XML body | `<booking><firstname>Jim</firstname><lastname>Brown</lastname><totalprice>111</totalprice><depositpaid>true</depositpaid><bookingdates><checkin>2018-01-01</checkin><checkout>2019-01-01</checkout></bookingdates><additionalneeds>Breakfast</additionalneeds></booking>` | Body accepted |
| 3 | Verify HTTP status code | — | `200 OK` |
| 4 | Verify response XML has `<bookingid>` element | — | `<bookingid>` is a positive integer |

**Expected Result:** HTTP 200; XML response with `<created-booking>` containing `<bookingid>` and `<booking>`

---

## TC-CB-003

| Field | Details |
|-------|---------|
| **TC-ID** | TC-CB-003 |
| **Summary** | Create booking without optional `additionalneeds` field |
| **Description** | Verify that a booking can be created without the optional `additionalneeds` field |
| **Priority** | High |
| **Labels** | API, Booking, Happy-Path, Optional-Field |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST `/booking` | `Content-Type: application/json` | Request is sent |
| 2 | Set body without `additionalneeds` | `{ "firstname": "Tom", "lastname": "Smith", "totalprice": 200, "depositpaid": false, "bookingdates": { "checkin": "2025-01-01", "checkout": "2025-01-10" } }` | Body accepted |
| 3 | Verify HTTP status code | — | `200 OK` |
| 4 | Verify response has `bookingid` | — | Positive integer |

**Expected Result:** HTTP 200; booking created successfully without `additionalneeds`

---

## TC-CB-004

| Field | Details |
|-------|---------|
| **TC-ID** | TC-CB-004 |
| **Summary** | Create booking with `depositpaid = false` |
| **Description** | Verify that depositpaid accepts `false` as a valid boolean value |
| **Priority** | High |
| **Labels** | API, Booking, Happy-Path, Boolean |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST `/booking` | Full valid body with `"depositpaid": false` | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` |
| 3 | Verify `depositpaid` in response | — | `false` in response booking object |

**Expected Result:** HTTP 200; `depositpaid` is `false` in the response

---

## TC-CB-005

| Field | Details |
|-------|---------|
| **TC-ID** | TC-CB-005 |
| **Summary** | Create booking with missing required `firstname` field |
| **Description** | Verify the API returns an error when `firstname` is omitted |
| **Priority** | High |
| **Labels** | API, Booking, Negative, Required-Field |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST `/booking` | Body without `firstname` field | Request is sent |
| 2 | Verify HTTP status code | — | `400 Bad Request` or `500 Internal Server Error` |
| 3 | Verify no booking is created | — | Error message returned |

**Expected Result:** API rejects the request; no booking ID assigned

---

## TC-CB-006

| Field | Details |
|-------|---------|
| **TC-ID** | TC-CB-006 |
| **Summary** | Create booking with missing required `lastname` field |
| **Description** | Verify the API returns an error when `lastname` is omitted |
| **Priority** | High |
| **Labels** | API, Booking, Negative, Required-Field |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST `/booking` | Body without `lastname`: `{ "firstname": "Jim", "totalprice": 111, "depositpaid": true, "bookingdates": { "checkin": "2018-01-01", "checkout": "2019-01-01" } }` | Request is sent |
| 2 | Verify HTTP status code | — | `400 Bad Request` or `500` |

**Expected Result:** API rejects the request; no booking ID returned

---

## TC-CB-007

| Field | Details |
|-------|---------|
| **TC-ID** | TC-CB-007 |
| **Summary** | Create booking with missing `bookingdates` object |
| **Description** | Verify the API returns an error when the entire `bookingdates` sub-object is missing |
| **Priority** | High |
| **Labels** | API, Booking, Negative, Required-Field |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST `/booking` | `{ "firstname": "Jim", "lastname": "Brown", "totalprice": 111, "depositpaid": true }` — no `bookingdates` | Request is sent |
| 2 | Verify HTTP status code | — | `400` or `500` |

**Expected Result:** API rejects the request; no booking ID returned

---

## TC-CB-008

| Field | Details |
|-------|---------|
| **TC-ID** | TC-CB-008 |
| **Summary** | Create booking where checkout date is before checkin date |
| **Description** | Verify the API handles a logically invalid date range (checkout < checkin) |
| **Priority** | High |
| **Labels** | API, Booking, Edge-Case, Date-Validation |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST `/booking` | `"checkin": "2025-12-31"`, `"checkout": "2025-01-01"` (checkout < checkin) | Request is sent |
| 2 | Verify HTTP status code | — | `400 Bad Request` or `500` |
| 3 | Verify no booking is created | — | Error message about invalid date range |

**Expected Result:** API rejects the logically invalid date range

---

## TC-CB-009

| Field | Details |
|-------|---------|
| **TC-ID** | TC-CB-009 |
| **Summary** | Create booking where checkin equals checkout (same day) |
| **Description** | Verify the API handles a zero-night booking (checkin = checkout) |
| **Priority** | Medium |
| **Labels** | API, Booking, Edge-Case, Date-Validation |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST `/booking` | `"checkin": "2025-06-01"`, `"checkout": "2025-06-01"` | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` or `400 Bad Request` |
| 3 | If 200 — verify booking is created | — | `bookingid` returned |

**Expected Result:** Documented behavior clarified — either accepted as a zero-night stay or rejected

---

## TC-CB-010

| Field | Details |
|-------|---------|
| **TC-ID** | TC-CB-010 |
| **Summary** | Create booking with `totalprice = 0` |
| **Description** | Verify the API accepts zero as a valid totalprice |
| **Priority** | Medium |
| **Labels** | API, Booking, Edge-Case, Boundary |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST `/booking` | Full valid body with `"totalprice": 0` | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` |
| 3 | Verify `totalprice` in response | — | `0` in response |

**Expected Result:** HTTP 200; booking created with `totalprice = 0`

---

## TC-CB-011

| Field | Details |
|-------|---------|
| **TC-ID** | TC-CB-011 |
| **Summary** | Create booking with negative `totalprice` |
| **Description** | Verify the API handles a negative totalprice value |
| **Priority** | Medium |
| **Labels** | API, Booking, Edge-Case, Boundary, Negative |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST `/booking` | Full body with `"totalprice": -100` | Request is sent |
| 2 | Verify HTTP status code | — | `400 Bad Request` or `200 OK` |
| 3 | If 200 — note as defect | — | Negative prices should not be accepted |

**Expected Result:** API should reject negative price (400); if 200 is returned, log as a defect

---

## TC-CB-012

| Field | Details |
|-------|---------|
| **TC-ID** | TC-CB-012 |
| **Summary** | Create booking with special characters in name fields |
| **Description** | Verify the API handles special characters in firstname and lastname |
| **Priority** | Low |
| **Labels** | API, Booking, Edge-Case, Input-Validation |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- API is reachable

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send POST `/booking` | `"firstname": "O'Brien"`, `"lastname": "<script>alert(1)</script>"` | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` or `400` |
| 3 | If 200 — verify data is stored as-is (not executed) | — | No XSS execution; special chars stored literally |

**Expected Result:** Special characters stored safely without execution; no injection possible

---

---

# SECTION 5 — BOOKING: UpdateBooking (PUT /booking/:id)

---

## TC-UB-001

| Field | Details |
|-------|---------|
| **TC-ID** | TC-UB-001 |
| **Summary** | Full update of an existing booking using Cookie auth — JSON |
| **Description** | Verify a full PUT update succeeds with a valid token in the Cookie header |
| **Priority** | Critical |
| **Labels** | API, Booking, Happy-Path, Smoke, Auth |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- A valid booking exists (e.g., ID 1)
- A valid auth token has been obtained via POST /auth

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send PUT `/booking/1` | `Content-Type: application/json`, `Accept: application/json`, `Cookie: token=<valid_token>` | Request is sent |
| 2 | Set full request body | `{ "firstname": "James", "lastname": "Brown", "totalprice": 111, "depositpaid": true, "bookingdates": { "checkin": "2018-01-01", "checkout": "2019-01-01" }, "additionalneeds": "Breakfast" }` | Body accepted |
| 3 | Verify HTTP status code | — | `200 OK` |
| 4 | Verify response body reflects updates | — | `firstname = "James"` in response |

**Expected Result:** HTTP 200; response body shows updated booking details

---

## TC-UB-002

| Field | Details |
|-------|---------|
| **TC-ID** | TC-UB-002 |
| **Summary** | Full update of booking using Basic Authorization header |
| **Description** | Verify a PUT update succeeds using `Authorization: Basic` instead of Cookie |
| **Priority** | High |
| **Labels** | API, Booking, Happy-Path, Auth, Basic-Auth |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Booking with ID 1 exists

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send PUT `/booking/1` | `Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=`, full valid body | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` |
| 3 | Verify response matches updated data | — | All fields updated correctly |

**Expected Result:** HTTP 200; booking updated successfully via Basic auth

---

## TC-UB-003

| Field | Details |
|-------|---------|
| **TC-ID** | TC-UB-003 |
| **Summary** | Update booking without any auth token returns 403 |
| **Description** | Verify that a PUT request without Cookie or Authorization header is rejected |
| **Priority** | Critical |
| **Labels** | API, Booking, Negative, Auth, Security |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Booking with ID 1 exists

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send PUT `/booking/1` | No `Cookie` or `Authorization` header | Request is sent |
| 2 | Set valid full body | Valid booking JSON | — |
| 3 | Verify HTTP status code | — | `403 Forbidden` |
| 4 | Verify booking is NOT updated | Re-fetch GET /booking/1 | Original data unchanged |

**Expected Result:** HTTP 403; update rejected; booking data unchanged

---

## TC-UB-004

| Field | Details |
|-------|---------|
| **TC-ID** | TC-UB-004 |
| **Summary** | Update booking with an invalid/expired token |
| **Description** | Verify that an invalid token value in Cookie is rejected |
| **Priority** | High |
| **Labels** | API, Booking, Negative, Auth, Security |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Booking with ID 1 exists

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send PUT `/booking/1` | `Cookie: token=invalidtoken999`, valid full body | Request is sent |
| 2 | Verify HTTP status code | — | `403 Forbidden` |

**Expected Result:** HTTP 403; update rejected for invalid token

---

## TC-UB-005

| Field | Details |
|-------|---------|
| **TC-ID** | TC-UB-005 |
| **Summary** | Update non-existent booking ID |
| **Description** | Verify that a PUT request targeting a non-existent booking ID returns 404 or 405 |
| **Priority** | High |
| **Labels** | API, Booking, Negative, Error-Scenario |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Valid auth token available; booking ID 999999 does not exist

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send PUT `/booking/999999` | Valid token, full valid body | Request is sent |
| 2 | Verify HTTP status code | — | `404 Not Found` or `405 Method Not Allowed` |

**Expected Result:** HTTP 404 or 405; no update performed

---

## TC-UB-006

| Field | Details |
|-------|---------|
| **TC-ID** | TC-UB-006 |
| **Summary** | Full update with missing required field (firstname) |
| **Description** | Verify that omitting a required field in PUT body returns an error |
| **Priority** | High |
| **Labels** | API, Booking, Negative, Required-Field |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Valid auth token; booking ID 1 exists

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send PUT `/booking/1` | Valid token, body without `firstname` | Request is sent |
| 2 | Verify HTTP status code | — | `400 Bad Request` |
| 3 | Verify booking not updated | Re-fetch booking | Original data unchanged |

**Expected Result:** HTTP 400; booking not modified

---

---

# SECTION 6 — BOOKING: PartialUpdateBooking (PATCH /booking/:id)

---

## TC-PUB-001

| Field | Details |
|-------|---------|
| **TC-ID** | TC-PUB-001 |
| **Summary** | Partial update — update firstname and lastname only using Cookie auth |
| **Description** | Verify that PATCH with only a subset of fields updates those fields without affecting others |
| **Priority** | Critical |
| **Labels** | API, Booking, Happy-Path, Smoke, PATCH |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Booking with ID 1 exists; valid auth token available

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Note current values of booking ID 1 | GET /booking/1 | Capture totalprice, depositpaid, bookingdates |
| 2 | Send PATCH `/booking/1` | `Cookie: token=<valid>`, body `{ "firstname": "James", "lastname": "Brown" }` | Request is sent |
| 3 | Verify HTTP status code | — | `200 OK` |
| 4 | Verify response has updated fields | — | `firstname = "James"`, `lastname = "Brown"` |
| 5 | Verify unmodified fields unchanged | — | `totalprice`, `depositpaid`, `bookingdates` match original |

**Expected Result:** HTTP 200; only `firstname` and `lastname` updated; all other fields unchanged

---

## TC-PUB-002

| Field | Details |
|-------|---------|
| **TC-ID** | TC-PUB-002 |
| **Summary** | Partial update — update totalprice only |
| **Description** | Verify PATCH can update only the totalprice field |
| **Priority** | High |
| **Labels** | API, Booking, Happy-Path, PATCH |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Booking with ID 1 exists; valid auth token available

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send PATCH `/booking/1` | `Cookie: token=<valid>`, body `{ "totalprice": 999 }` | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` |
| 3 | Verify `totalprice` in response | — | `999` |
| 4 | Verify other fields unchanged | — | `firstname`, `lastname`, dates unaffected |

**Expected Result:** HTTP 200; `totalprice` updated to 999; all other fields unchanged

---

## TC-PUB-003

| Field | Details |
|-------|---------|
| **TC-ID** | TC-PUB-003 |
| **Summary** | Partial update using Basic Authorization header |
| **Description** | Verify PATCH accepts Basic auth as an alternative to Cookie |
| **Priority** | High |
| **Labels** | API, Booking, Happy-Path, Auth, PATCH |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Booking with ID 1 exists

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send PATCH `/booking/1` | `Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=`, body `{ "firstname": "Jim" }` | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` |
| 3 | Verify `firstname` updated | — | `firstname = "Jim"` in response |

**Expected Result:** HTTP 200; partial update successful via Basic auth

---

## TC-PUB-004

| Field | Details |
|-------|---------|
| **TC-ID** | TC-PUB-004 |
| **Summary** | Partial update without auth token returns 403 |
| **Description** | Verify unauthenticated PATCH is rejected |
| **Priority** | Critical |
| **Labels** | API, Booking, Negative, Auth, Security, PATCH |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Booking with ID 1 exists

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send PATCH `/booking/1` | No auth header, body `{ "firstname": "Hacker" }` | Request is sent |
| 2 | Verify HTTP status code | — | `403 Forbidden` |
| 3 | Verify booking not modified | GET /booking/1 | Original firstname unchanged |

**Expected Result:** HTTP 403; booking data unchanged

---

## TC-PUB-005

| Field | Details |
|-------|---------|
| **TC-ID** | TC-PUB-005 |
| **Summary** | Partial update with empty body |
| **Description** | Verify the API handles an empty JSON body `{}` for PATCH |
| **Priority** | Medium |
| **Labels** | API, Booking, Edge-Case, PATCH |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Booking with ID 1 exists; valid auth token available

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send PATCH `/booking/1` | Valid auth, body `{}` | Request is sent |
| 2 | Verify HTTP status code | — | `200 OK` or `400 Bad Request` |
| 3 | If 200 — verify booking data unchanged | GET /booking/1 | No fields modified |

**Expected Result:** Either 400 error or 200 with no change to booking data

---

## TC-PUB-006

| Field | Details |
|-------|---------|
| **TC-ID** | TC-PUB-006 |
| **Summary** | Partial update on non-existent booking ID |
| **Description** | Verify PATCH targeting a non-existent booking returns 404 |
| **Priority** | High |
| **Labels** | API, Booking, Negative, Error-Scenario, PATCH |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Valid auth token; booking ID 999999 does not exist

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send PATCH `/booking/999999` | Valid auth, body `{ "firstname": "Test" }` | Request is sent |
| 2 | Verify HTTP status code | — | `404 Not Found` |

**Expected Result:** HTTP 404; no booking modified

---

---

# SECTION 7 — BOOKING: DeleteBooking (DELETE /booking/:id)

---

## TC-DB-001

| Field | Details |
|-------|---------|
| **TC-ID** | TC-DB-001 |
| **Summary** | Delete a booking using Cookie auth token |
| **Description** | Verify that a booking is successfully deleted when a valid token is provided in Cookie |
| **Priority** | Critical |
| **Labels** | API, Booking, Happy-Path, Smoke, Delete |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- A booking exists (create one first via POST /booking); valid auth token available

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Create a new booking | POST /booking with full valid body | Note the returned `bookingid` |
| 2 | Send DELETE `/booking/<bookingid>` | `Content-Type: application/json`, `Cookie: token=<valid_token>` | Request is sent |
| 3 | Verify HTTP status code | — | `201 Created` (as documented) |
| 4 | Verify booking is gone | Send GET `/booking/<bookingid>` | `404 Not Found` |

**Expected Result:** HTTP 201; subsequent GET returns 404

---

## TC-DB-002

| Field | Details |
|-------|---------|
| **TC-ID** | TC-DB-002 |
| **Summary** | Delete a booking using Basic Authorization header |
| **Description** | Verify deletion succeeds using `Authorization: Basic` header |
| **Priority** | High |
| **Labels** | API, Booking, Happy-Path, Auth, Delete |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- A booking exists; Basic auth credentials are known

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Create a new booking | POST /booking | Note `bookingid` |
| 2 | Send DELETE `/booking/<bookingid>` | `Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=` | Request is sent |
| 3 | Verify HTTP status code | — | `201 Created` |
| 4 | Verify booking is deleted | GET `/booking/<bookingid>` | `404 Not Found` |

**Expected Result:** HTTP 201; booking no longer retrievable

---

## TC-DB-003

| Field | Details |
|-------|---------|
| **TC-ID** | TC-DB-003 |
| **Summary** | Delete booking without auth token returns 403 |
| **Description** | Verify unauthenticated DELETE is rejected |
| **Priority** | Critical |
| **Labels** | API, Booking, Negative, Auth, Security, Delete |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- A booking exists

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send DELETE `/booking/1` | No `Cookie` or `Authorization` header | Request is sent |
| 2 | Verify HTTP status code | — | `403 Forbidden` |
| 3 | Verify booking still exists | GET `/booking/1` | `200 OK` with booking data |

**Expected Result:** HTTP 403; booking data intact

---

## TC-DB-004

| Field | Details |
|-------|---------|
| **TC-ID** | TC-DB-004 |
| **Summary** | Delete booking with invalid auth token |
| **Description** | Verify that an invalid token value in Cookie is rejected for DELETE |
| **Priority** | High |
| **Labels** | API, Booking, Negative, Auth, Security, Delete |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- A booking exists

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send DELETE `/booking/1` | `Cookie: token=totallywrongtoken` | Request is sent |
| 2 | Verify HTTP status code | — | `403 Forbidden` |

**Expected Result:** HTTP 403; booking not deleted

---

## TC-DB-005

| Field | Details |
|-------|---------|
| **TC-ID** | TC-DB-005 |
| **Summary** | Delete non-existent booking ID |
| **Description** | Verify the API returns an appropriate error when attempting to delete a non-existent booking |
| **Priority** | High |
| **Labels** | API, Booking, Negative, Error-Scenario, Delete |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Valid auth token; booking ID 999999 does not exist

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send DELETE `/booking/999999` | Valid auth (Cookie or Basic) | Request is sent |
| 2 | Verify HTTP status code | — | `404 Not Found` or `405 Method Not Allowed` |

**Expected Result:** HTTP 404 or 405; no deletion performed

---

## TC-DB-006

| Field | Details |
|-------|---------|
| **TC-ID** | TC-DB-006 |
| **Summary** | Delete an already-deleted booking (idempotency) |
| **Description** | Verify the behavior when the same booking is deleted twice consecutively |
| **Priority** | Medium |
| **Labels** | API, Booking, Edge-Case, Idempotency, Delete |
| **Component** | Booking |
| **Status** | Not Executed |

**Pre-conditions:**
- Valid auth token; a booking is created and then deleted

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Create a booking | POST /booking | Note `bookingid` |
| 2 | Delete the booking | DELETE `/booking/<id>` with valid auth | HTTP 201 |
| 3 | Delete the same booking again | DELETE `/booking/<id>` with valid auth | — |
| 4 | Verify second delete response | — | `404 Not Found` (booking no longer exists) |

**Expected Result:** Second DELETE returns 404; no server crash or unhandled error

---

---

# SECTION 8 — PING: HealthCheck (GET /ping)

---

## TC-PING-001

| Field | Details |
|-------|---------|
| **TC-ID** | TC-PING-001 |
| **Summary** | Health check endpoint returns 201 Created |
| **Description** | Verify the API ping endpoint confirms the server is up and running |
| **Priority** | Critical |
| **Labels** | API, Ping, Happy-Path, Smoke, Health-Check |
| **Component** | Ping |
| **Status** | Not Executed |

**Pre-conditions:**
- Network connectivity to `restful-booker.herokuapp.com` is available

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send GET request to `/ping` | No headers required | Request is sent |
| 2 | Verify HTTP status code | — | `201 Created` |
| 3 | Verify response body | — | `"OK"` or equivalent success string |

**Expected Result:** HTTP 201; response confirms server is operational

---

## TC-PING-002

| Field | Details |
|-------|---------|
| **TC-ID** | TC-PING-002 |
| **Summary** | Health check endpoint responds within acceptable latency |
| **Description** | Verify the ping endpoint responds within a reasonable time threshold (performance baseline) |
| **Priority** | Medium |
| **Labels** | API, Ping, Performance, Smoke |
| **Component** | Ping |
| **Status** | Not Executed |

**Pre-conditions:**
- Network connectivity available

**Test Steps:**

| Step | Action | Test Data | Expected Result |
|------|--------|-----------|-----------------|
| 1 | Send GET `/ping` and measure response time | — | Request sent |
| 2 | Record response time | — | — |
| 3 | Verify response time | — | Response received within 3000 ms |

**Expected Result:** HTTP 201; response time ≤ 3000 ms

---

---

# TEST SUMMARY TABLE

| TC-ID | Endpoint | Summary | Priority | Category |
|-------|----------|---------|----------|----------|
| TC-AUTH-001 | POST /auth | Valid credentials return token | Critical | Happy Path |
| TC-AUTH-002 | POST /auth | Invalid username returns error | High | Negative |
| TC-AUTH-003 | POST /auth | Invalid password returns error | High | Negative |
| TC-AUTH-004 | POST /auth | Missing username field | High | Edge Case |
| TC-AUTH-005 | POST /auth | Empty request body | Medium | Edge Case |
| TC-AUTH-006 | POST /auth | Empty string credentials | Medium | Edge Case |
| TC-GBI-001 | GET /booking | Get all booking IDs | Critical | Happy Path |
| TC-GBI-002 | GET /booking | Filter by firstname | High | Happy Path |
| TC-GBI-003 | GET /booking | Filter by firstname + lastname | High | Happy Path |
| TC-GBI-004 | GET /booking | Filter by checkin date | High | Happy Path |
| TC-GBI-005 | GET /booking | Filter by checkout date | High | Happy Path |
| TC-GBI-006 | GET /booking | Non-existent name returns empty array | Medium | Edge Case |
| TC-GBI-007 | GET /booking | Invalid date format for checkin filter | Medium | Edge Case |
| TC-GB-001 | GET /booking/:id | Get booking by valid ID — JSON | Critical | Happy Path |
| TC-GB-002 | GET /booking/:id | Get booking by valid ID — XML | Medium | Happy Path |
| TC-GB-003 | GET /booking/:id | Non-existent ID returns 404 | High | Negative |
| TC-GB-004 | GET /booking/:id | Non-numeric ID | Medium | Edge Case |
| TC-GB-005 | GET /booking/:id | Negative ID | Low | Edge Case |
| TC-CB-001 | POST /booking | Create booking all fields — JSON | Critical | Happy Path |
| TC-CB-002 | POST /booking | Create booking via XML | Medium | Happy Path |
| TC-CB-003 | POST /booking | Create without additionalneeds | High | Happy Path |
| TC-CB-004 | POST /booking | Create with depositpaid = false | High | Happy Path |
| TC-CB-005 | POST /booking | Missing firstname | High | Negative |
| TC-CB-006 | POST /booking | Missing lastname | High | Negative |
| TC-CB-007 | POST /booking | Missing bookingdates | High | Negative |
| TC-CB-008 | POST /booking | Checkout before checkin | High | Edge Case |
| TC-CB-009 | POST /booking | Same-day checkin and checkout | Medium | Edge Case |
| TC-CB-010 | POST /booking | totalprice = 0 | Medium | Edge Case |
| TC-CB-011 | POST /booking | Negative totalprice | Medium | Edge Case |
| TC-CB-012 | POST /booking | Special characters in name fields | Low | Edge Case |
| TC-UB-001 | PUT /booking/:id | Full update with Cookie auth | Critical | Happy Path |
| TC-UB-002 | PUT /booking/:id | Full update with Basic auth | High | Happy Path |
| TC-UB-003 | PUT /booking/:id | Update without auth token | Critical | Negative |
| TC-UB-004 | PUT /booking/:id | Update with invalid token | High | Negative |
| TC-UB-005 | PUT /booking/:id | Update non-existent booking | High | Negative |
| TC-UB-006 | PUT /booking/:id | Update with missing required field | High | Negative |
| TC-PUB-001 | PATCH /booking/:id | Partial update firstname + lastname | Critical | Happy Path |
| TC-PUB-002 | PATCH /booking/:id | Partial update totalprice only | High | Happy Path |
| TC-PUB-003 | PATCH /booking/:id | Partial update with Basic auth | High | Happy Path |
| TC-PUB-004 | PATCH /booking/:id | Partial update without auth | Critical | Negative |
| TC-PUB-005 | PATCH /booking/:id | Partial update with empty body | Medium | Edge Case |
| TC-PUB-006 | PATCH /booking/:id | Partial update non-existent ID | High | Negative |
| TC-DB-001 | DELETE /booking/:id | Delete booking with Cookie auth | Critical | Happy Path |
| TC-DB-002 | DELETE /booking/:id | Delete booking with Basic auth | High | Happy Path |
| TC-DB-003 | DELETE /booking/:id | Delete without auth token | Critical | Negative |
| TC-DB-004 | DELETE /booking/:id | Delete with invalid token | High | Negative |
| TC-DB-005 | DELETE /booking/:id | Delete non-existent booking | High | Negative |
| TC-DB-006 | DELETE /booking/:id | Delete already-deleted booking | Medium | Edge Case |
| TC-PING-001 | GET /ping | Health check returns 201 | Critical | Happy Path |
| TC-PING-002 | GET /ping | Health check response latency | Medium | Performance |

---

**Total: 50 Test Cases**  
- Critical: 12  
- High: 24  
- Medium: 10  
- Low: 4
