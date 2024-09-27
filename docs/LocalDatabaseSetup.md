# Docker and PostgreSQL Setup with Docker Compose

## 1. What is Docker?

Docker is a platform that allows you to package applications and their dependencies into **containers**. Containers
are lightweight, portable units that run the same regardless of the environment, ensuring consistency from development
to production.

## 2. What is Docker Compose?

Docker Compose is a tool for defining and running multi-container Docker applications. Using a YAML file
(`docker-compose.yml`), you can configure all your application's services, making it easy to start and stop them with
a single command.

## 3. Using Docker Compose for PostgreSQL Setup

Docker Compose simplifies the setup of a PostgreSQL database by allowing you to define the database service in a
configuration file. This ensures that every developer sets up the database in the same way, reducing inconsistencies
and setup time.

## 4. Explanation of the Provided `docker-compose.yml` File

Here's a breakdown of your `docker-compose.yml` file:

```yaml
version: '3.1'

services:
  db:
    image: postgres # Uses the official PostgreSQL image
    container_name: dodao-ui-db # Names the container for easy reference
    restart: always # Automatically restarts the container if it stops
    environment:
      POSTGRES_USER: admin # Sets the database user to 'admin'
      POSTGRES_PASSWORD: admin # Sets the database password to 'admin'
      POSTGRES_DB: next_app_localhost_db # Creates a database named 'next_app_localhost_db'
    ports:
      - '5432:5432' # Exposes port 5432 to the host
    volumes:
      - ./data:/var/lib/postgresql/data # Persists data to the './data' folder
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql # Runs 'init.sql' on first run
```

- **Services**: Defines a single service called `db`, which is our PostgreSQL database.
- **Image**: Specifies the Docker image to use (PostgreSQL).
- **Container Name**: Assigns a custom name to the container.
- **Environment Variables**: Sets up database credentials and the initial database.
- **Ports**: Maps the container's PostgreSQL port to the host machine.
- **Volumes**:
  - `./data:/var/lib/postgresql/data`: Binds the local `data` folder to the container's data directory for persistence.
  - `./init.sql:/docker-entrypoint-initdb.d/init.sql`: Executes the `init.sql` script when the database initializes.

## 5. How Data is Stored in the "data" Folder

The line `./data:/var/lib/postgresql/data` maps the container's data directory to a local folder named `data`. This means:

- **Data Persistence**: Your database data is saved on your local machine.
- **Portability**: You can back up or inspect the data directly from the `data` folder.
- **Container Independence**: Even if the Docker container is removed, your data remains intact in the `data` folder.

## 6. How `init.sql` Works

The line `./init.sql:/docker-entrypoint-initdb.d/init.sql` mounts your local `init.sql` script into the container's
initialization directory. Here's what happens:

- **Automatic Execution**: When the PostgreSQL container is run for the first time, it looks for scripts in `/docker-entrypoint-initdb.d/` and executes them.
- **Database Initialization**: `init.sql` can contain SQL commands to set up your database schema, tables, or seed data.
- **One-Time Setup**: This script runs only if the database is not already initialized (i.e., when the `data` folder is empty).

## 7. How to Recreate the Database to Start from Scratch

To reset your database:

1. **Stop and Remove Containers**: Run `docker-compose down` to stop and remove the containers.
2. **Delete the Data Folder**: Remove the `data` folder by executing `rm -rf ./data`. This deletes all your database data.
3. **Restart the Containers**: Run `docker-compose up` to start fresh. The `init.sql` script will run again, reinitializing your database.

   **Note:** Ensure that docker container is running fine by checking the terminal logs when you run the command. If you see the below statements in the logs then that means docker container is running fine:

```bash
  dodao-ui-db  | running bootstrap script ... ok
  .
  .
  .
  dodao-ui-db  | CREATE ROLE
  dodao-ui-db  | CREATE TABLE
  dodao-ui-db  | ALTER TABLE
  .
  .
  .
  dodao-ui-db  | INSERT 0 1
  dodao-ui-db  | INSERT 0 1
  .
  .
  .
  dodao-ui-db  | 2024-09-26 13:38:40.557 UTC [1] LOG:  database system is ready to accept connections
```

**Warning**: Deleting the `data` folder will permanently remove all data stored in the database. Ensure you have
backups if needed.

---

By using Docker and Docker Compose, you streamline the setup process, ensuring consistency and reducing the chances
of environment-related bugs. The `docker-compose.yml` file provided sets up a PostgreSQL database that's easy to manage
and share among your development team.
