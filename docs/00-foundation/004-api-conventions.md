# 004 - API Conventions

**Document ID:** 004

**Document Name:** API Conventions

**Status:** Draft

---

# 1. Purpose

This document defines the API standards for Practice365.

Every backend endpoint must follow these conventions.

The objective is to provide a predictable, secure and consistent API surface for both frontend developers and AI-generated implementations.

---

# 2. API Principles

## API-001

RESTful principles should be followed where practical.

---

## API-002

JSON is the standard request and response format.

---

## API-003

Every endpoint must be documented inside its respective Module PRD.

---

## API-004

Business rules belong in services.

Controllers only orchestrate requests and responses.

---

## API-005

Every endpoint must validate incoming requests before executing business logic.

---

# 3. URL Convention

Use plural resource names.

Examples

```
/api/auth/login

/api/users

/api/firms

/api/leads

/api/matters

/api/invoices
```

Avoid verbs inside resource URLs except where they represent explicit actions.

Examples

```
POST /auth/login

POST /auth/logout

POST /auth/refresh
```

---

# 4. HTTP Methods

GET

Retrieve data.

POST

Create resources or execute actions.

PUT

Replace an existing resource.

PATCH

Partially update an existing resource.

DELETE

Delete or archive resources.

---

# 5. HTTP Status Codes

Use standard HTTP status codes.

```
200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

500 Internal Server Error
```

Avoid custom status codes.

---

# 6. Response Format

Successful responses should follow a consistent structure.

Example

```json
{
    "success": true,
    "data": {}
}
```

---

Failed responses

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": []
}
```

---

# 7. Pagination

Endpoints returning collections must support pagination.

Standard query parameters

```
?page=1

?limit=25
```

Response

```json
{
    "success": true,
    "data": [],
    "pagination": {
        "page": 1,
        "limit": 25,
        "total": 140,
        "pages": 6
    }
}
```

---

# 8. Sorting

Sorting uses

```
?sortBy=createdAt

&order=asc
```

Allowed values

```
asc

desc
```

---

# 9. Filtering

Filtering uses query parameters.

Example

```
?status=ACTIVE

&practiceArea=FamilyLaw
```

Filtering must be documented inside each Module PRD.

---

# 10. Searching

Search uses

```
?q=smith
```

Search behavior is module specific.

---

# 11. Validation

Every endpoint validates

- Path Parameters
- Query Parameters
- Request Body

Validation occurs before business logic executes. Validation should be done using middleware or guards.

---

# 12. Authentication

Protected endpoints require authentication.

Authentication occurs before authorization.

---

# 13. Authorization

Authentication identifies the user.

Authorization determines whether the user may perform the requested action.

Authorization rules belong to each business module.

---

# 14. Versioning

The initial release does not expose public API versioning.

If versioning becomes necessary, use URL versioning.

Example

```
/api/v1/
```

---

# 15. Idempotency

GET requests must never modify data.

DELETE should be idempotent.

Repeated identical requests should produce predictable outcomes.

---

# 16. Error Handling

All errors should use the standard error response format.

Do not expose

- stack traces
- database errors
- internal implementation details

to API consumers.

---

# 17. File Uploads

File upload endpoints should only accept supported file types.

Maximum file sizes are defined by the relevant module.

Files are uploaded to object storage.

MongoDB stores metadata only.

---

# 18. API Documentation

Every Module PRD must define

- endpoints
- request types
- response types
- validation rules
- authentication requirements
- authorization requirements

This document defines only the global conventions.

---

# 19. API Review Checklist

Before approving an endpoint verify

- URL follows conventions.
- Correct HTTP verb used.
- Validation exists.
- Authentication enforced.
- Authorization enforced.
- Response format consistent.
- Error format consistent.
- Pagination supported where required.
- Filtering documented.
- Search documented.