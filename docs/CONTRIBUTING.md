# Contribution Guide

As this is a group project only group members are able to contribute to the project.

## Requirements

1. [Node.js 12.11.0](https://nodejs.org/en/)
2. [PostgreSQL](https://www.postgresql.org/)

## Setting up the development environment

1. Clone the repo: `git clone https://github.com/duckies/form-submission-system.git`
2. Run `npm install` in the root directory to install dependencies.
3. Copy the `ormconfig.example.json` file contents into a new file called `ormconfig.json` and modify it as discussed in the group to connect to our development database.
4. Run `npm run frontend:watch` and `npm run backend:watch` in separate terminals in the root directory to start both frontend and backend development servers.

> The repository is structured as a monorepo and is maintained by the [Lerna](https://github.com/lerna/lerna) package. When a new library is added to the repository, `npm install` will need to ran once again in the **root** directory. Running `npm install` in the backend or frontend directories will work but may bloat the size of your repository.

## Repository Commands

- `npm run bootstrap` is a command run after `npm install` finishes to clean the dependencies of the repo. You can run `npm install` in the root directory instead of using this command.

### Frontend

- `npm run frontend:build`: Compiles the frontend into production-ready code.
- `npm run frontend:start`: Starts the frontend server after using the previous command.
- `npm run frontend:watch`: A development command that compiles and starts the frontend and automatically recompiles necessary code when changes are detected.
- `npm run frontend:lint`: Checks to see if the frontend code conforms to style guidelines.
- `npm run frontend:test`: Runs frontend tests. This may require special database setup.

### Backend

- `npm run backend:build`: Compiles the backend into production-ready code.
- `npm run backend:start`: Startes the backend server after using the previous command.
- `npm run backend:watch`: A development command that compiles and starts the backend and automatically recompiles necessary code when changes are detected.
- `npm run backend:lint`: Checks to see if the backend conforms to style guidelines.
- `npm run backend:test`: Runs backend tests. This may require special database setup.

## Making Pull Requests

The majority of changes made to the project should be done through pull requests so they can be tracked on the Kanban board. For more advanced information on how to use git, I recommend this tutorial: [Git Branching - Basic Branching and Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)

1. Get the latest changes from the repository to keep up-to-date:

```
git pull
```

2. Create a new branch to contain your feature, change or fix and switch to it:

```
git checkout -b <your-branch-name>
```

3. Push the branch to github:

```
git push origin <your-branch-name>
```

4. Make your changes and update your branch:

```
// The -a adds all currently tracked and modified files to the commit.
// The git add command is only necessary if you have created any new files.
git add .
git commit -a -m "My commit message"
```

5. Update your changes:

```
git push
```

6. Create a Pull Request on GitHub to track your branch and keep us informed of the changes you are making. Once you are finished with the feature, we will review the work as a group before we merge the changes.

If you use Visual Studio Code, it includes support for Git by default and lets you create branches, update your local repository, and push changes without needing these commands. If you encounter Git conflicts, Visual Studio Code will also highlight the areas of code that need to be rectified before the changes are pushed to the repository.
