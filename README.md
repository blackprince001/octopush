
# Project Documentation: Octopush - A Simple Concurrent File Server

## Overview

Octopush is a Go-based file server designed to handle file uploads, downloads, and other related operations in a concurrent manner. The project utilizes the Gin framework for routing and GORM for database interactions.

### Directory Structure

The project follows a well-organized directory structure, which is crucial for maintaining code readability, maintainability, and scalability.

```bash
blackprince001-octopush/
├── .env.example
├── api/
│   ├── controllers/
│   │   └── file.controller.go
│   └── routes/
│       └── file.route.go
├── go.sum
├── internal/
│   ├── models/
│   │   └── file.model.go
│   ├── database/
│   │   └── db.go
│   ├── config/
│   │   └── env.go
│   └── utils/
│       └── string_gen.go
├── .dockerignore
├── cmd/
│   └── main.go
├── Dockerfile
├── go.mod
└── README.md
```

### Key Directories and Files

- **`.env.example`**: Example environment variables file.
- **`api/`**:
  - **`controllers/`**: Contains the `file.controller.go` which handles file upload and download logic.
  - **`routes/`**: Contains the `file.route.go` which defines the API routes for file operations.
- **`internal/`**:
  - **`models/`**: Defines the data models, specifically the `File` model in `file.model.go`.
  - **`database/`**: Handles database connections and operations in `db.go`.
  - **`config/`**: Manages environment variables and configuration in `env.go`.
  - **`utils/`**: Utility functions, such as generating short links in `string_gen.go`.
- **`cmd/`**: The application entry point, `main.go`, which sets up the server and routes.
- **`Dockerfile`**: Instructions for building and deploying the application using Docker.
- **`go.mod`**: Go module file managing dependencies.
- **`README.md`**: Project overview and documentation.

### Features

#### File Upload

- Users can upload files using the `/file/upload` endpoint.
- The upload process is handled concurrently, ensuring efficient use of resources.
- Each uploaded file is assigned a unique short link and stored in the database along with the file metadata.

#### File Download

- Files can be downloaded using the `/file/download/:shortLink` endpoint.
- The download process checks for the file's existence in the database and on the server before serving it.

#### Configuration and Environment

- Environment variables are managed using the `godotenv` package.
- Key configurations include server port, storage path, and the length of the short links.

#### Database

- The project uses SQLite as the database, managed by GORM.
- The database stores file metadata such as the short link, filename, and the time of the last update.

### Usage

#### Running the Server

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/blackprince001/octopush.git
   ```

2. **Navigate to the Project Directory**:

   ```bash
   cd octopush
   ```

3. **Build and Run the Application**:

   ```bash
   go build -o octopush cmd/main.go
   ./octopush
   ```

   Alternatively, you can use Docker:

   ```bash
   docker build -t octopush .
   docker run -p 5678:5678 octopush
   ```

#### API Endpoints

- **Upload File**:

  ```bash
  curl -X POST http://localhost:5678/file/upload -F 'file=@path/to/your/file'
  ```

- **Download File**:

  ```bash
  curl http://localhost:5678/file/download/:shortLink
  ```

### Features and Future Improvements

- [X] Upload
- [X] Download
- [ ] Grouped Upload (recursively uploading every file in group)
- [ ] Grouped Download (recursively downloading every file in group)

Optionals

- [ ] Checksum compute to verify data compactness

### Contributing

Contributions are welcome. Here are some ways you can contribute:

- **Pull Requests**: Submit pull requests for new features, bug fixes, or improvements.
- **Issue Reports**: Report any issues or bugs you encounter.
- **Documentation**: Help improve the documentation by adding more details or clarifying existing sections.
