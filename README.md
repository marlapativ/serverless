# CSYE6225 Serverless Application

[![serverless deploy](https://github.com/CSYE6225-Cloud-Computing-Organization/serverless/actions/workflows/deploy.yml/badge.svg)](https://github.com/CSYE6225-Cloud-Computing-Organization/serverless/actions/workflows/deploy.yml)

---

## Requirements

For development, you will only need Node.js and a node global package, npm, installed in your environement.

### Node

- #### Node installation on Windows

Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

    You can install nodejs and npm easily with apt install, just run the following commands.

    $ sudo apt install nodejs
    $ sudo apt install npm

- #### Other Operating Systems

  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v8.11.3

    $ npm --version
    6.1.0

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    npm install npm -g

### Install npm dependencies

    cd project_folder
    npm install

## How to run

### Running API server locally

    npm run start

You will know server is running by checking the output of the command `npm run start`

    Serving function...
    Function: addUser
    Signature type: cloudevent
    URL: http://localhost:8080/

**Note:** `8080` will be the default port. Override process.env.PORT to change the port

### Running API on production

Build the application using the following command.
This would generate a folder called dist in the current directory

    npm run build

To deploy the server on GCP, please follow the tutorial [here](https://cloud.google.com/functions/docs/deploying/filesystem)
