# Authentication-Authorization Project

This project demonstrates a web application that implements authentication and authorization using Angular for the frontend, ASP.NET Core API for the backend, and SQL Server with Entity Framework for data storage.

## Technologies Used

- **Frontend:**
  - Angular
  - BootStrap
- **Backend:**
  - ASP.NET Core API

- **Database:**
  - SQL Server
  - Entity Framework

## Features

- User authentication and authorization.
- Secure storage of user information in a SQL Server database.
- Role-based access control (RBAC) for controlling user permissions.
- Implementation of JSON Web Tokens (JWT) for secure communication between the frontend and backend.

## Prerequisites

Before running the project, ensure that you have the following installed:

- Node.js and npm for Angular development.
- Visual Studio or Visual Studio Code for ASP.NET Core development.
- SQL Server for database storage.

## Getting Started

1. Clone the repository:

    ```bash
    git clone https://github.com/akshaylalti/Authentication-Authorization-Project.git
    ```

2. Navigate to the frontend directory and install dependencies:

    ```bash
    cd frontend
    npm install
    ```

3. Open the backend solution in Visual Studio or Visual Studio Code and configure the database connection in the `appsettings.json` file.

4. Run the migrations to create the database schema:

    ```bash
    dotnet ef database update
    ```

5. Run the application:

    - Start the backend API.
    - Run the Angular frontend.

## Configuration

- Configure authentication settings in the `appsettings.json` file in the backend.
- Adjust role-based access control in the Angular application based on your requirements.

## Documentation

For detailed documentation on how to use and configure the authentication and authorization features, please refer to the [Wiki](../../wiki).

## Contributing

Contributions are welcome! Please follow the [Contributing Guidelines](CONTRIBUTING.md) to contribute to this project.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- Special thanks to the Angular, ASP.NET Core, and Entity Framework communities.

