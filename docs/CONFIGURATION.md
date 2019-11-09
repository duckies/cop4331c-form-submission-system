# Configuring the Application

The form system utilizes a configuration file to modify certain behaviors of the application, as well as providing the database credentials. This is done with a `config.env` file with an example template provided by the `config.env.example` file.

```
NODE_ENV = 'production'
DATABASE_TYPE = 'postgres'
DATABASE_HOST = 'localhost'
DATABASE_PORT = '3306'
DATABASE_USERNAME = 'admin'
DATABASE_PASSWORD = 'admin'
DATABASE_NAME = 'formdb'
DATABASE_SYNCHRONIZE = false
DATABASE_SSL = true
TOKEN_EXPIRATION_HOURS = 24
TOKEN_SECRET = 'SomethingSuperSecrety$%^'
```

Please carefully read the explanations for each of the settings:

- **NODE_ENV** should be either set to `development` or `production`. For the client, this should almost always be set to production. This setting toggles developmental features that are unnecessary for the client, and enables necessary performance features when in production.
- **DATABASE_TYPE** should be set to either `postgres` or `mysql` depending on the type of database provided.
- **DATABASE_HOST** should be the URL or IP of the database to connect to.
- **DATABASE_PORT** the open port for the database to communicate with.
- **DATABASE_USERNAME** the username for the account granting the system access to the database.
- **DATABASE_PASSWORD** the password for the database account.
- **DATABASE_NAME** the name of the database to store our data.
- **DATABASE_SYNCHRONIZE** a dangerous setting that should be left disabled and can be withheld from the configuration file. This setting is used in development to automatically restructure the database as changes are made to the code. This may involve dropping and re-adding tables that can result in dramatic loss of data at the benefit of not having to patch the database manually.
- **DATABASE_SSL** is to toggle if the backend should attempt database connections using SSL or not. Typically this should be disabled if the database is running on the same machine as the backend. Databases provided online will usually, and should be, encrypted using SSL and will require this setting.
- **TOKEN_EXPIRATION_HOURS** determins how long an authentication token will remain valid in hours. This setting can be ommited, and in doing so will default to a 24-hour token expiration time. As we use JWT tokens, it's not possible to invalidate all tokens without modifying the secret below, so we do not recommand setting this to an unreasonably high number in an attempt to make authentication permanent.
- **TOKEN_SECRET** is a secret string only the client should know used to encrypt and decrypt the client's authentication token. Changing this token will immediately invalidate any currently authenticated devices of the client's.
