# Errors
- Client side functions
	- throw errors with strings (same as server util) (we do this to homogenize with syntax errors)
	- catching errors -> catch the error, console.error it and bring up a toast()
- Server side functions
	- API functions -> res.status(500).send(response.json())
	- Util functions -> return normal errors (same as client functions) (we do this to homogenize with syntax errors)
		- handling response -> if !response.ok, then JSON.stringify(response.json())

- ERROR OBJECTS CAN ONLY TAKE STRINGS: CONSOLE.ERROR(obj), THEN ERROR A DESCRIPTION