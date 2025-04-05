
# Octopush - A File Server

Octopush is a Go-based file server designed to handle file uploads, downloads, and other related operations in a manner. The project utilizes the Gin framework for routing and GORM for database interactions.

![Video Demo](https://github.com/user-attachments/assets/f8f0cc9d-e915-4d14-a837-e9843f521c14)

## Usage

### Running the Server

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/blackprince001/octopush.git
   ```

2. **Navigate to the Project Directory**:

   ```bash
   cd octopush
   ```

3. **Build and Run only the server**:

   ```bash
   go build -o octopush cmd/main.go
   ./octopush
   ```

   Alternatively, you can use Docker:

   ```bash
   docker build -t octopush .
   docker run -p 5678:5678 octopush
   ```

### Running Entire Application

1. **Clone the Repository**:

  We run the compose file and build all containers

   ```bash
   docker compose -f compose/local-dev.yml up --remove-orphans
   ```

### API Endpoints

- **Upload File**:

  ```bash
  curl -X POST http://localhost:5678/files/upload -F 'file=@path/to/your/file'
  ```

- **Upload File**:

  ```bash
  curl -X POST http://localhost:5678/files/upload/:groupName -F 'file=@path/to/your/file' -F 'file=@path/to/your/anotherfile'
  ```

- **Download File**:

  ```bash
  curl http://localhost:5678/files/download/item/:shortLink
  ```

- **Download File**:

  ```bash
  curl http://localhost:5678/files/download/group/:groupName
  ```

- **Pull Information for All Files**:

  ```bash
  curl http://localhost:5678/files
  ```

- **Pull Single File Information**:

  ```bash
  curl GET http://localhost:5678/files/item/:shortLink
  ```

## Features and Future Improvements

- [X] Upload
- [X] Download
- [X] Delete Objects from storage
- [X] Grouped Upload (recursively uploading every file in group)
- [X] Grouped Download (recursively downloading every file in group)

## Contributing

Contributions are welcome. Here are some ways you can contribute:

- **Pull Requests**: Submit pull requests for new features, bug fixes, or improvements.
- **Issue Reports**: Report any issues or bugs you encounter.
- **Documentation**: Help improve the documentation by adding more details or clarifying existing sections.
