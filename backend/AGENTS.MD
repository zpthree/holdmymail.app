# Hold My Mail application

## Summary

The Hold My Mail application is going to be a web application that receives mail and holds it for the user until they are ready to view it.

The application will allow users to set up schedules the mail they receive to Hold My Mail gets delivered to their actual inbox.

## Features

- Receive and hold mail for users.
- Schedule mail delivery to the user's actual inbox.
- View held mail at any time.
- Health check endpoint to ensure the service is running.

## Endpoints

- `GET /` - Returns a welcome message.
- `GET /health` - Returns the health status of the service.

## User Authentication

- `POST /auth/register` - Registers a new user.
- `POST /auth/login` - Authenticates a user and returns a token.
- `POST /auth/logout` - Logs out a user and invalidates the token.
- `GET /auth/:id` - Retrieves a specific user.
- `PUT /auth/:id` - Updates a specific user.
- `DELETE /auth/:id` - Deletes a specific user.

## Sender Handling

- `POST /sender` - Registers a new sender.
- `GET /sender` - Retrieves all registered senders.
- `GET /sender/:id` - Retrieves a specific sender.
- `DELETE /sender/:id` - Deletes a specific sender.
- `PUT /sender/:id` - Updates a specific sender. Can add tags to group senders.

## Email Handling

- `POST /email` - Receives an email and holds it for the user.
- `GET /email` - Retrieves held emails for the user.
- `GET /email/:id` - Retrieves a specific held email for the user.
- `POST /email/schedule` - Schedules the delivery of held emails to the user's actual inbox.
- `DELETE /email/:id` - Deletes a specific held email for the user.

## Digest

- `POST /digest` - Generates and sends a digest email for the user.
- `GET /digest` - Retrieves the latest digest for the user.

## Links

- `POST /link` - Receives a link and saves it in the database.
- `GET /link` - Retrieves all saved links.
- `GET /link/:id` - Retrieves a specific saved link.
- `DELETE /link/:id` - Deletes a specific saved link.
- `PUT /link/:id` - Updates a specific saved link -- can add tags to group common links.
