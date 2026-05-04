# EXPRESS TEMPLATE

## How to use

- **Install**

  <details>
  <summary><strong>For Nix Users (click to expand)</strong></summary>

  - there is a `devshell` provided for quickstart which installs `node lts` and `prisma`

  - if you use `direnv` ,

    ```sh
    direnv allow
    ```

  - otherwise run

    ```sh
    nix develop
    ```

  </details>

  - In the command line run `npm install` to install the dependencies

- **Setup Environment**

  - Create a file named `.env` in the project root.
  - Add `PORT=3000` (or any port you prefer).
  - To use the log-in functionality you'll need the session functionality too. Sessions require a database to be connected.
  - To use the database functionality, add this to the `.env`:
    ```
    DATABASE_URL='your full database URL'
    SESSION_SECRET='a random string'
    ```
  - The `SESSION_SECRET` will be used to encrypt passwords. Any people trying to access your database and login will need to have the exact same `SESSION_SECRET` as the one used originally.

- **Run the server**

  - In the command line, run `node app` to start the server.
  - By default, the homepage will show: **"Template project loaded"**.
  - You will also see a message in the browser console:
    **"this is a public file"** (demonstrating serving a public file used by an EJS template).

---

## Features Included

- **MVC structure**

  Organized into controllers, routes, views, and database modules.

- **dotenv**

  Used to set your `PORT` and `DATABASE_URL` environment variables.

- **Express**

  - Configured to use EJS as the view engine
  - Serves `/public` as the static assets directory

- **pg (PostgreSQL)**

  Using `Pool` from the `pg` library to query the database defined in `DATABASE_URL`.

- **Authentication - Passport**

  Passport is used for authentication on this template. All the configuration is already done. When connecting a database, all the necessary tables will automatically initialize. Sessions are stored on the database using `connect-pg-simple`, so logged-in sessions will be remembered even if the node server is stopped. `bcryptjs` is used to encrypt all the passwords in the database, so if the users table is ever leaked, no passwords will get exposed.
