# Task Management Application

A full-stack task management application with a Spring Boot REST API backend and an Angular frontend. This application provides comprehensive task management capabilities with advanced filtering, search, and sorting features.

## Overview

This project consists of two main components:

**Backend**: A RESTful API built with Spring Boot 3.5.6 and MongoDB that handles all task operations, validation, and data persistence.

**Frontend**: A modern, responsive Angular 18 application with Bootstrap 5 UI that provides an intuitive interface for managing tasks.

## Features

### Core Functionality
- Complete CRUD operations for task management
- Advanced filtering by status, priority, and date range
- Real-time search across task titles and descriptions
- Flexible sorting by priority, due date, title, or creation date
- Comprehensive form validation with detailed error messages
- Responsive design that works on desktop, tablet, and mobile devices

### Backend Features
- RESTful API with versioning (api/v1)
- MongoDB database with Spring Data
- Global exception handling with consistent error responses
- Input validation using Bean Validation
- CORS configuration for frontend integration
- Comprehensive unit and integration tests
- Postman collection with 25 pre-configured requests

### Frontend Features
- Bootstrap 5 UI components with custom styling
- Bootstrap Icons integration for consistent iconography
- Real-time task statistics dashboard
- Modal dialogs for create, edit, and detail views
- Advanced filter panel with multiple criteria
- Animated transitions and hover effects
- Loading states and error handling
- Time-ago display for task creation dates
- Character counter for title input

## Technology Stack

### Backend
- Java 21
- Spring Boot 3.5.6
- Spring Data MongoDB
- Maven 3.6+
- JUnit 5 and Mockito for testing

### Frontend
- Angular 18.2.0
- TypeScript 5.5.2
- Bootstrap 5
- Bootstrap Icons
- RxJS 7.8.0
- Jasmine and Karma for testing

## Prerequisites

### Backend Requirements
- Java 21 or higher
- Maven 3.6 or higher
- MongoDB Atlas account or local MongoDB installation

### Frontend Requirements
- Node.js 18 or higher
- npm 9 or higher
- Angular CLI 18

## Installation and Setup

### Backend Setup

1. Clone the repository
```bash
git clone https://github.com/haithemmihoubi/task-management
cd task-managemnt
```

2. Configure MongoDB connection

Open `src/main/resources/application.yaml` and update the MongoDB connection string:
```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/taskdb
```

For local MongoDB, use:
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/taskdb
```

3. Build the project
```bash
./mvnw clean install
```

4. Run the application
```bash
./mvnw spring-boot:run
```

The backend API will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory
```bash
cd task-managemnt-front
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

The frontend application will start on `http://localhost:4200`

4. Open your browser and navigate to `http://localhost:4200`

## API Documentation

### Base URL
```
http://localhost:8080/api/v1/tasks
```

### Endpoints

**Create Task**
```http
POST /api/v1/tasks
Content-Type: application/json

{
    "title": "Complete documentation",
    "description": "Write comprehensive API documentation",
    "status": "TODO",
    "priority": 1,
    "dueDate": "2025-12-31"
}
```

Response: 201 Created

**Get All Tasks**
```http
GET /api/v1/tasks
```

Response: 200 OK with array of tasks

**Get Task by ID**
```http
GET /api/v1/tasks/{id}
```

Response: 200 OK or 404 Not Found

**Update Task**
```http
PUT /api/v1/tasks/{id}
Content-Type: application/json

{
    "title": "Updated title",
    "description": "Updated description",
    "status": "IN_PROGRESS",
    "priority": 2,
    "dueDate": "2025-11-30"
}
```

Response: 200 OK

**Delete Task**
```http
DELETE /api/v1/tasks/{id}
```

Response: 204 No Content

### Query Parameters for Filtering

The GET all tasks endpoint supports the following query parameters:

| Parameter | Type | Description | Example Values |
|-----------|------|-------------|----------------|
| status | String | Filter by task status | TODO, IN_PROGRESS, DONE |
| priority | Integer | Filter by priority level | 1, 2, 3, 4, 5 |
| dueDateFrom | Date | Start of date range | 2025-10-01 |
| dueDateTo | Date | End of date range | 2025-12-31 |
| search | String | Search in title and description | documentation |
| sortBy | String | Field to sort by | priority, dueDate, title, createdAt |
| sortDirection | String | Sort direction | asc, desc |

### Example Queries

Filter by status:
```http
GET /api/v1/tasks?status=TODO
```

Filter by priority:
```http
GET /api/v1/tasks?priority=1
```

Filter by date range:
```http
GET /api/v1/tasks?dueDateFrom=2025-10-01&dueDateTo=2025-12-31
```

Search tasks:
```http
GET /api/v1/tasks?search=documentation
```

Advanced multi-criteria filter:
```http
GET /api/v1/tasks?status=TODO&priority=1&dueDateFrom=2025-10-01&sortBy=dueDate&sortDirection=asc
```

## Data Model

### Task Object

```json
{
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "enum",
    "priority": "integer",
    "dueDate": "date",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
}
```

### Field Descriptions

**id**: Unique identifier generated by MongoDB

**title**: Required field, 1-200 characters

**description**: Optional field, maximum 1000 characters

**status**: Required enum value (TODO, IN_PROGRESS, DONE)

**priority**: Required integer between 1-5
- 1: Critical priority
- 2: High priority
- 3: Medium priority
- 4: Low priority
- 5: Very low priority

**dueDate**: Optional date field in ISO format (YYYY-MM-DD)

**createdAt**: Automatically generated timestamp

**updatedAt**: Automatically updated timestamp

## Validation Rules

### Backend Validation

**Title**
- Required field
- Minimum 1 character
- Maximum 200 characters

**Description**
- Optional field
- Maximum 1000 characters

**Status**
- Required field
- Must be one of: TODO, IN_PROGRESS, DONE

**Priority**
- Required field
- Must be integer between 1 and 5

**Due Date**
- Optional field
- Must be valid date format

### Frontend Validation

The frontend includes real-time validation with immediate user feedback:
- Title length counter shows remaining characters
- Required field indicators
- Inline validation messages
- Form submission prevention when invalid

## Error Handling

### Validation Error (400 Bad Request)
```json
{
    "timestamp": "2025-10-04T10:30:00",
    "status": 400,
    "error": "Validation Failed",
    "message": "Input validation failed",
    "validationErrors": {
        "title": "Title is required",
        "priority": "Priority must be between 1 and 5"
    }
}
```

### Not Found Error (404)
```json
{
    "timestamp": "2025-10-04T10:30:00",
    "status": 404,
    "error": "Not Found",
    "message": "Task not found with id: xyz"
}
```

### Server Error (500)
```json
{
    "timestamp": "2025-10-04T10:30:00",
    "status": 500,
    "error": "Internal Server Error",
    "message": "An unexpected error occurred"
}
```

## Testing

### Backend Tests

Run all tests:
```bash
./mvnw test
```

Run specific test class:
```bash
./mvnw test -Dtest=TaskServiceTest
```

The backend includes comprehensive tests for:
- Service layer CRUD operations
- Controller endpoints
- Validation logic
- Exception handling
- Filter and search functionality

### Frontend Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Generate coverage report:
```bash
npm test -- --code-coverage
```

The frontend includes 75+ test cases covering:
- HTTP service operations
- Component initialization and lifecycle
- CRUD operations with modals
- Filter and search functionality
- Form validation
- Helper methods
- Integration tests
- Error handling

Test coverage includes:
- Service tests: HTTP operations, query parameters, error handling
- Component tests: UI interactions, modals, validation
- Model tests: Interfaces, enums, type safety
- Integration tests: End-to-end workflows

## Project Structure

### Backend Structure
```
src/
├── main/
│   ├── java/com/haithem/taskmanagemnt/
│   │   ├── controller/        REST API endpoints
│   │   ├── service/           Business logic layer
│   │   ├── repository/        Database access layer
│   │   ├── model/             Domain entities
│   │   ├── dto/               Data transfer objects
│   │   ├── exception/         Custom exceptions and handlers
│   │   └── TaskManagemntApplication.java
│   └── resources/
│       └── application.yaml   Application configuration
└── test/
    └── java/com/haithem/taskmanagemnt/
        ├── controller/        Controller tests
        └── service/           Service tests
```

### Frontend Structure
```
src/app/
├── components/
│   └── task-list/            Main task management component
├── models/
│   └── task.model.ts         Task interface and enums
├── services/
│   └── task.service.ts       HTTP service for API calls
├── testing/
│   └── test-utils.ts         Test utilities and helpers
├── app.component.ts          Root component
├── app.config.ts             Application configuration
└── app.routes.ts             Routing configuration
```

## Using the Application

### Creating a Task

1. Click the "New Task" button in the header
2. Fill in the task details:
   - Title (required): Enter a descriptive title
   - Description (required): Add detailed information
   - Status: Select TODO, IN_PROGRESS, or DONE
   - Priority: Choose from 1 (Critical) to 5 (Very Low)
   - Due Date (optional): Set a deadline
3. Click "Create Task" to save

### Filtering Tasks

Use the filters panel to narrow down tasks:
1. Search: Enter keywords to search in titles and descriptions
2. Status: Filter by task status
3. Priority: Filter by priority level
4. Due Date Range: Set start and end dates
5. Sort By: Choose field to sort by
6. Order: Select ascending or descending
7. Click "Apply Filters" to update the list
8. Click "Clear All Filters" to reset

### Editing a Task

1. Click the "Edit" button on any task card
2. Modify the task details in the modal
3. Click "Update Task" to save changes

### Viewing Task Details

1. Click the "View" button on any task card
2. See all task information including:
   - Full description
   - Creation and update timestamps
   - Task ID
3. Click "Edit Task" to make changes from the detail view

### Deleting a Task

1. Click the "Delete" button on any task card
2. Confirm the deletion in the dialog
3. The task will be removed immediately

## Postman Collection

The project includes a comprehensive Postman collection with 25 pre-configured requests:

### Import Instructions

1. Open Postman
2. Click "Import" button
3. Select `Task-Management-API.postman_collection.json`
4. The collection will be added to your workspace

### Collection Contents

The collection includes requests for:
- Creating tasks with different priorities
- Retrieving all tasks
- Getting specific tasks by ID
- Filtering by status (TODO, IN_PROGRESS, DONE)
- Filtering by priority levels
- Date range filtering
- Keyword search
- Sorting operations
- Updating tasks
- Deleting tasks
- Validation error examples

### Collection Variables

The collection uses the following variable:
- baseUrl: http://localhost:8080 (default)
- taskId: Automatically set when creating tasks

## Configuration

### Backend Configuration

Edit `application.yaml` to configure:

**MongoDB Connection**
```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://username:password@cluster.mongodb.net/taskdb
```

**Server Port**
```yaml
server:
  port: 8080
```

**CORS Configuration**
```yaml
cors:
  allowed-origins: http://localhost:4200
```

### Frontend Configuration

Edit `src/environments/environment.ts` to configure:

**API URL**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

## Troubleshooting

### Backend Issues

**Cannot connect to MongoDB**
- Verify MongoDB is running
- Check connection string in application.yaml
- Ensure network access is allowed in MongoDB Atlas

**Port already in use**
- Change server port in application.yaml
- Kill process using port 8080

**Tests failing**
- Ensure MongoDB is accessible
- Run `./mvnw clean install` to rebuild

### Frontend Issues

**Cannot connect to API**
- Verify backend is running on port 8080
- Check API URL in environment configuration
- Verify CORS is enabled on backend

**Dependencies not installed**
- Delete node_modules and package-lock.json
- Run `npm install` again

**Build errors**
- Clear Angular cache: `npm run ng cache clean`
- Rebuild: `npm run build`

## Development Guidelines

### Adding New Features

**Backend**
1. Create or modify entity in model package
2. Add repository method if needed
3. Implement service logic
4. Create controller endpoint
5. Add validation rules
6. Write unit tests
7. Update API documentation

**Frontend**
1. Update task model if needed
2. Add service method for API call
3. Implement UI component changes
4. Add form validation
5. Update styling as needed
6. Write unit tests
7. Test integration with backend

### Code Quality

**Backend**
- Follow Spring Boot best practices
- Use meaningful variable and method names
- Add JavaDoc comments for public methods
- Maintain test coverage above 80%
- Handle all exceptions appropriately

**Frontend**
- Follow Angular style guide
- Use TypeScript strict mode
- Maintain component separation of concerns
- Write descriptive test cases
- Keep components focused and reusable

## Deployment

### Backend Deployment

**Building for Production**
```bash
./mvnw clean package
```

The JAR file will be created in `target/` directory.

**Running Production Build**
```bash
java -jar target/task-managemnt-0.0.1-SNAPSHOT.jar
```

**Environment Variables**
Set the following for production:
- MONGODB_URI: Production MongoDB connection string
- SERVER_PORT: Production server port
- CORS_ORIGINS: Production frontend URL

### Frontend Deployment

**Building for Production**
```bash
npm run build
```

Build artifacts will be in `dist/` directory.

**Deploy to Web Server**
Copy the contents of `dist/task-managemnt-front/` to your web server.

**Environment Configuration**
Update `environment.prod.ts` with production API URL.

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch
```bash
git checkout -b feature/amazing-feature
```
3. Commit your changes
```bash
git commit -m 'Add amazing feature'
```
4. Push to the branch
```bash
git push origin feature/amazing-feature
```
5. Open a Pull Request

### Contribution Guidelines

- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Follow existing code style
- Ensure all tests pass before submitting PR

## License

This project is licensed under the MIT License.

## Author

Haithem Mihoubi

Email: haithemmihoubi1234@gmail.com

GitHub: https://github.com/haithemmihoubi

## Acknowledgments

Built with Spring Boot, MongoDB, Angular, and Bootstrap.

Special thanks to the open-source community for the excellent tools and libraries that made this project possible.

## Support

For issues, questions, or suggestions:
1. Check existing documentation
2. Review troubleshooting section
3. Open an issue on GitHub
4. Contact the author

## Version History

**Version 1.0.0** (October 2025)
- Initial release
- Complete CRUD operations
- Advanced filtering and search
- Responsive Angular frontend
- Comprehensive test suite
- Postman collection included

## Future Enhancements

Planned features for future releases:
- User authentication and authorization
- Task categories and tags
- File attachments for tasks
- Task comments and activity history
- Email notifications for due tasks
- Task assignments to multiple users
- Dashboard with charts and analytics
- Export tasks to CSV or PDF
- Dark mode theme
- Mobile application
- Real-time updates with WebSocket
- Task templates
- Recurring tasks
- Task dependencies

## Resources

**Spring Boot Documentation**: https://spring.io/projects/spring-boot

**Spring Data MongoDB**: https://spring.io/projects/spring-data-mongodb

**Angular Documentation**: https://angular.io/docs

**Bootstrap Documentation**: https://getbootstrap.com/docs

**MongoDB Documentation**: https://docs.mongodb.com

