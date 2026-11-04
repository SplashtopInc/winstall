# Specification: installer-error-sanitization

## Purpose
Ensures that all installer generation and task status endpoints sanitize internal unexpected exceptions and mask sensitive system failure details while generating a unique correlation ID for tracking and server-side log correlation.

## ADDED Requirements

### Requirement: Installer generation failure sanitization
When the installer generation endpoint encounters an unhandled exception during processing or background dispatch, the endpoint MUST return HTTP 500 with a generic error message and a unique correlation ID, without exposing internal exception messages or stack traces.

#### Scenario: Unhandled failure in installer endpoint returns generic error and correlation ID
- GIVEN the installer API endpoint receives a valid or invalid build request
- WHEN an unhandled internal exception or downstream service failure occurs during processing
- THEN the response status code MUST be 500
- AND the JSON response body MUST contain `error` with value "An unexpected error occurred while processing your request."
- AND the JSON response body MUST contain a non-empty string `correlationId`
- AND the JSON response body MUST NOT expose internal error details, stack traces, or raw exception messages

### Requirement: Installer status query failure sanitization
When the installer status check endpoint encounters an unhandled exception during Redis retrieval or S3 URL generation, the endpoint MUST return HTTP 500 with a generic error message and a unique correlation ID.

#### Scenario: Unhandled failure in status endpoint returns generic error and correlation ID
- GIVEN the installer status API endpoint receives a status query request
- WHEN an unhandled exception is thrown during status inspection or presigned URL retrieval
- THEN the response status code MUST be 500
- AND the JSON response body MUST contain `error` with value "Failed to retrieve installer status."
- AND the JSON response body MUST contain a non-empty string `correlationId`
- AND the response MUST NOT include the internal raw `error.message`

### Requirement: Installer callback processing failure sanitization
When the installer completion callback endpoint encounters an unhandled exception during task status persistence, the endpoint MUST return HTTP 500 with a generic error message and a unique correlation ID.

#### Scenario: Unhandled failure in callback endpoint returns generic error and correlation ID
- GIVEN the installer callback API endpoint receives a task completion callback
- WHEN an unhandled exception occurs while updating task status in Redis
- THEN the response status code MUST be 500
- AND the JSON response body MUST contain `error` with value "Callback processing failed."
- AND the JSON response body MUST contain a non-empty string `correlationId`
- AND the response MUST NOT leak Redis connection or internal database error messages

### Requirement: Server error log correlation
Whenever an unexpected exception is caught and sanitized across installer endpoints, the server MUST emit an error log entry tagged with the identical correlation ID and the full error object.

#### Scenario: Server logs include correlation ID and original error
- GIVEN an unhandled exception occurs in any installer endpoint
- WHEN the catch block generates a correlation ID
- THEN the server error log MUST output an entry referencing that correlation ID along with the original error object
- AND any subsequent cleanup errors in the same context MUST also reference the same correlation ID

### Requirement: Frontend installer logging sanitization
The client-side installer utility MUST NOT log installer configuration details to the browser console, keeping debugging output confined to server-side logs.

#### Scenario: Installer download flow does not log config in browser
- GIVEN the user initiates an installer download in the client browser
- WHEN `downloadInstantInstaller` builds the installer configuration payload
- THEN the client MUST NOT output the installer configuration object to `console.log` regardless of environment
- AND the server-side log SHALL remain the single source of truth for installer configuration logs in development mode
