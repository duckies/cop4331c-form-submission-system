# Configuring the Application

The form system utilizes a configuration file to modify certain behaviors of the application, as well as providing the database credentials. This is done with a `config.env` file with an example template provided by the `config.env.example` file.

```
BACKEND_HOST = 'localhost'
BACKEND_PORT = 3000
BACKEND_HTTPS = false
FRONTEND_PORT = 3030
DATABASE_TYPE = 'postgres'
DATABASE_HOST = 'localhost'
DATABASE_PORT = '3306'
DATABASE_USERNAME = 'admin'
DATABASE_PASSWORD = 'admin'
DATABASE_NAME = 'formdb'
DATABASE_SYNCHRONIZE = false
DATABASE_SSL = true
DROP_SCHEMA = false
TOKEN_EXPIRATION_HOURS = 24
TOKEN_SECRET = 'SomethingSuperSecrety$%^'
```

## Networking Configuration

The frontend and backend both require ports reachable from the internet for other users to properly use the application and for file previews to contact Google's servers.

It's recommended to use Nginx to setup reverse proxies for better performance, easier customization, and security through SSL. View the [recommend nginx configuration](https://nuxtjs.org/faq/nginx-proxy/) for the frontend if Nginx is employed.

A barebones installation would involve setting the `BACKEND_PORT` to your ip address, and port-forwarding ports `3000` and `3030`. Then you could access the website from `http://your-ip-address:3000`. The default port and host values default in such a way that the application can run on localhost, but file previews will not work.

- **FRONTEND_PORT** is an optional setting to change the default frontend port to something other than `3030`.
- **FRONTEND_HOST** is an optional setting to change the default host resolving address from localhost, it is unlikely this ever needs to be changed.
- **BACKEND_PORT** is an optional setting to change the default backend port to something other than `3000`.
- **BACKEND_HOST** is the ip or domain to reach the backend on, do not include the `http://` or any ending slashes, e.g. `duckie.cc` or `12.345.67.89`. This is the address the frontend will use on client browsers to communicate with the backend.
- **BACKEND_HTTPS** deligates to the frontend that the backend must be reached using SSL encryption, do not enable this if SSL is not enabled on the backend.

## Database Settings

These are required settings to establish proper database connectivity and authentication.

- **DATABASE_TYPE** should be set to either `postgres` or `mysql` depending on the type of database provided.
- **DATABASE_HOST** should be the ip or domain of the database to connect to, defaults to localhost.
- **DATABASE_PORT** the open port for the database to communicate with.
- **DATABASE_USERNAME** the username for the account granting the system access to the database.
- **DATABASE_PASSWORD** the password for the database account.
- **DATABASE_NAME** the name of the database to store our data.
- **DATABASE_SSL** is to toggle if the backend should attempt database connections using SSL or not. Typically this should be disabled if the database is running on the same machine as the backend. Databases provided online will usually, and should be, encrypted using SSL and will require this setting.

## Authentication Settings

These augment how the JWT tokens are generated and how long they last before expiring.

- **TOKEN_EXPIRATION_HOURS** determins how long an authentication token will remain valid in hours. This setting can be ommited, and in doing so will default to a 24-hour token expiration time. As we use JWT tokens, it's not possible to invalidate all tokens without modifying the secret below, so we do not recommand setting this to an unreasonably high number in an attempt to make authentication permanent.
- **TOKEN_SECRET** is a required secret string only the client should know used to encrypt and decrypt the client's authentication token. Changing this token will immediately invalidate any currently authenticated devices of the client's.

## Development Settings

These settings should not be included in the configuration file in a production environment.

- **NODE_ENV** should be either set to `development` or `production`. For the client, this should almost always be set to production. This setting toggles developmental features that are unnecessary for the client, and enables necessary performance features when in production.
- **DATABASE_SYNCHRONIZE** a dangerous setting that should be left disabled and can be withheld from the configuration file. This setting is used in development to automatically restructure the database as changes are made to the code. This may involve dropping and re-adding tables that can result in dramatic loss of data at the benefit of not having to patch the database manually.
- **DROP_SCHEMA** optional command that purges all tables in the database when the connection is establed. This is used for end-to-end testing.
