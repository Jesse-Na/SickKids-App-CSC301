# Code for the app, website, and backend

Note in each folder there is another README explaining more about each part of the code but here is an overview:

### Backend
This is currently made using serverless for deployment to AWS. 

Note that currently there are two apis. One for admins and another for users. The admin one requires authentication with cognito but the user one does not. The user one currently in each function validates the api key that is sent which is somewhat custom authentication and that is stored in a hash in the database. 


Technologies used:
* Serverless (sets up cloud formation but could probably go directly with cloud formation instead): https://www.serverless.com/
* Cloud formation (deploys all resources needed for backend): https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html
* Resources used:
    * RDS - database
    * Lambda - functions run (admin + user)
    * Cognito - admin authentication
    * KMS - currently not used but should be added for credentials such as db password
    * API Gateway - creates REST api endpoints for functions to be accessed from frontend
    * Amplify - not really used in the backend but in both frontends to make any calls to the backend

![Backend Architecture](https://github.com/PCIGITI/Smart-Socks-CSC301/assets/98052631/25ee6570-609d-49ec-bb15-d9b56eacf85a)

### App
This is a React Native app (https://reactnative.dev/) made with expo (https://expo.dev/). Expo does nice things such as makes certain native phone functionalities easier like permissions or camera or whatever you want. Also if you look at eas under expo, there may be some setup but it will allow for building bundles that can be submitted to app stores so you don't have to yourself (you just need a developer account at least for apple).

### Website
This is made with React. A lot of the styling I took from the mui library which is pretty much taken from google. Otherwise it uses Amplify from aws to talk to the backend and do things such as the login so I don't have to worry about security.



# Ryan Notes 

## Todo:
* Update credentials of databse (maybe add secrets manager or kms to manage them)
* Add VPC to serverless configuration so you don't have to add it manually to the two lambdas each deploy
* When deoploying for production, switch stage from dev to prod in severless.yml

## For testing backend
* Install postgres
* install typescript cli
* install 
* Create database with details found in backend/src/database/db

## For deploying backend:
* go to serverless.com and create an account
* install sls `npm install -g serverless`
* cd into backend
* `serverless`
* 
