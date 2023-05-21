# API Quality and Security
- All API endpoints are
	- validating inputs
	- catching errors
# Error Handling
1. Error objects can only be created with strings
2. Objects can be thrown `throw {}`
## Client side functions
- helper functions -> `console.error(res)` and throw a descriptive error (for UI)
- UI functions -> catch thrown error and toast it
## Server side functions
- API functions
	- catch error, and `return res.status(500).send(err as apiObject)`
- Util functions
	- throw errors and objects