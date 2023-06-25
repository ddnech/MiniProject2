# Mini Project Backend

Welcome to the Mini Project Backend! This project showcases the power of backend technologies, providing a robust and scalable solution for managing and publishing blog posts. With its extensive feature set and adherence to industry standards, it empowers developers to create an exceptional blogging experience.

## What the Project Does

The project serves as a backend implementation for a blogging website. It leverages various backend technical skills and frameworks to deliver a robust and scalable solution for managing and publishing blog posts. The backend system handles user authentication, blog post management, category organization, and other essential features of a blogging platform. It provides secure API endpoints for front-end applications to interact with, allowing users to create, read, update, and delete blog posts, as well as perform other actions such as liking posts and managing user profiles. The project emphasizes code quality, performance, and maintainability, following best practices and industry standards in software development.

## Getting Started

To get started with the project, follow these steps:

### Prerequisites

- Node.js (v18.15.0)
- npm (9.5.0)

### Installation

1. Clone the repository:

    `git clone <repository-url>`

2. Install the required dependencies:

    `npm install`
   
### Configuration

In the folder, there is a file called .env.example that you can refer to create an .env file and configure it based on your preferences. Customize the configuration files according to your needs.

### Database Setup

Set up your MySQL database.

Run the database migrations:

    npx sequelize-cli db:migrate

Populate the categories table by running the seeders:

    npx sequelize-cli db:seed --seed create-categories

### Usage

Start the development server (Nodemon is included as a dev dependency):

    npm start

Access the application throught postman for testing, your base path can be configure based at the .env specified in your file.

## Additional Features

Take advantage of the following additional features:

- Sequelize and Sequelize CLI: Utilize the power of Sequelize ORM for easy database migrations and seeding.

## Message From the Creator

Thank you for exploring the Mini Project Backend! Feel free to reach out with any questions or feedback.

## Dependencies

Here is the package.json file and the dependencies used in this project:

{

  "name": "miniproject2",
  
  "version": "1.0.0",
  
  "description": "",
  
  "main": "index.js",
  
  "scripts": {
  
    "test": "echo \"Error: no test specified\" && exit 1",
    
    "start": "nodemon index.js",
    
    "sequelize-cli": "sequelize-cli"
    
  },
  
  "author": "",
  "license": "ISC",
  
  "dependencies": {
  
    "bcrypt": "^5.1.0",
    
    "dayjs": "^1.11.8",
    
    "dotenv": "^16.1.4",

    "express": "^4.18.2",
    
    "express-validator": "^7.0.1",
    
    "handlebars": "^4.7.7",
    
    "jsonwebtoken": "^9.0.0",
    
    "multer": "^1.4.5-lts.1",

    "mysql2": "^3.3.4",
    
    "nodemailer": "^6.9.3"
  }
}
