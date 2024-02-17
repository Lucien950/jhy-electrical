# API Quality and Security
- All API endpoints are
	- validating inputs
	- catching errors
# Error Handling
1. Anything outside of happy path will be thrown 
## Client side functions
- Catch the error, console.error it
- Display a toast to say that some error has been thrown
## Server side functions
- just throw error lmao it will be caught by apiHandler