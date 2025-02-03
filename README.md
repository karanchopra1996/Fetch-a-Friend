
Fetch Dogs API

General Information

Welcome to the Fetch Dogs API! This API provides access to a database of dogs available for adoption, along with location-based services to help users find the right match. The API supports authentication, filtering, and retrieving detailed information about dogs and their locations.

Base URL

https://frontend-take-home-service.fetch.com

Data Models
Dog

{
  "id": "string",
  "img": "string",
  "name": "string",
  "age": "integer",
  "zip_code": "string",
  "breed": "string"
}

Location

{
  "zip_code": "string",
  "latitude": "float",
  "longitude": "float",
  "city": "string",
  "state": "string",
  "county": "string"
}

Coordinates

{
  "lat": "float",
  "lon": "float"
}

Authentication

Quick Summary:

`` - Authenticate user and receive an auth cookie.

`` - Logout user and invalidate session.

Login

Endpoint: POST /auth/login

Request Body:

{
  "name": "string",
  "email": "string"
}

Outcome: Returns an HttpOnly auth cookie (fetch-access-token) valid for 1 hour.

Note: Requests must include credentials (credentials: 'include' for fetch).

Logout

Endpoint: POST /auth/logout

Purpose: Ends the user session and invalidates the auth cookie.

Dogs Endpoints

Quick Summary:

`` - Retrieve all possible dog breed names.

`` - Search dogs based on breed, age, and location.

`` - Fetch detailed information for specific dog IDs.

`` - Match a dog for adoption from a list of provided IDs.

Retrieve Dog Breeds

Endpoint: GET /dogs/breeds

Purpose: Retrieves an array of all possible dog breed names.

Search for Dogs

Endpoint: GET /dogs/search

Filtering Parameters:

breeds: Array of breed names.

zipCodes: Array of ZIP codes.

ageMin & ageMax: Minimum and maximum age filters.

Additional Parameters:

size: Number of results to return (default: 25).

from: Cursor for pagination.

sort: Sorting criteria (field:[asc|desc], sortable by breed, name, or age).

Response Structure:

{
  "resultIds": ["dogId1", "dogId2", ...],
  "total": 100,
  "next": "query_for_next_page",
  "prev": "query_for_previous_page"
}

Limit: Maximum of 10,000 matches per query.

Fetch Dog Details

Endpoint: POST /dogs

Purpose: Fetches detailed information for a list of dog IDs.

Request Body:

["dogId1", "dogId2", "dogId3"]

Response: Array of dog objects matching the provided IDs.

Match a Dog for Adoption

Endpoint: POST /dogs/match

Purpose: Selects a single dog ID from a provided list to represent an adoption match.

Request Body:

["dogId1", "dogId2", "dogId3"]

Response:

{
  "match": "dogId_selected"
}

Locations Endpoints

Quick Summary:

`` - Fetch detailed location information for given ZIP codes.

`` - Search locations based on city, state, or geographic bounding box.

Fetch Location Details

Endpoint: POST /locations

Purpose: Fetches detailed location information for provided ZIP codes.

Request Body:

["zipCode1", "zipCode2"]

Response: Array of Location objects.

Search Locations

Endpoint: POST /locations/search

Filtering Parameters:

city: Full or partial city name.

states: Array of two-letter state/territory abbreviations.

geoBoundingBox: Defines a geographic bounding box using either:

top, left, bottom, right

bottom_left, top_right (or bottom_right, top_left)

Each coordinate must include lat and lon.

Additional Parameters:

size: Number of results to return (default: 25).

from: Cursor for pagination.

Response Structure:

{
  "results": [
    {
      "zip_code": "90210",
      "latitude": 34.0901,
      "longitude": -118.4065,
      "city": "Beverly Hills",
      "state": "CA",
      "county": "Los Angeles"
    }
  ],
  "total": 5000
}

Limit: Maximum of 10,000 ZIP code matches per query.

Usage Notes

Authenticate using the login endpoint before making requests.

Use pagination for large result sets.

Include credentials: 'include' in fetch requests to maintain the session.

