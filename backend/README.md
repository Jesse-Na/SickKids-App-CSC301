# Deployment Instructions

This project uses Serverless with AWS as the provider to deploy the backend API made with AWS Lambda functions and a Postgres database hosted on RDS. As such, you must first create a [Serverless](https://www.serverless.com/) and [AWS](https://aws.amazon.com/console/) account, and [add AWS as a provider](https://www.serverless.com/framework/docs/guides/providers) to your Serverless account. Additionally, you must install the Serverless CLI and provide it with credentials to your Serverless account, [NodeJS](https://nodejs.org/en/download) for its package manager **npm**, and the typescript compiler [tsc](https://www.typescriptlang.org/download). There are numerous videos and tutorials online to help you with these steps, so ensure they are done in advance for a smoother execution of the instructions below.

1. Install package dependencies as specified in the package.json file with:

```
npm install
```

2. Since we have written our AWS Lambda functions in Typescript, you will need to also compile the Typescript into Javascript using configuration settings specified in the tsconfig.json file by running:

```
tsc
```

3. Configure the serverless.yml file by providing the *org* of your serverless account, the profile.provider, DBName, MasterUsername, and MasterUserPassword. Beware of any naming limitations for AWS and Postgres. Also, do not confuse these attributes for other similarly named attributes. We've indicated the attributes you need to change with a TODO in the file.

4. Now, you can deploy the API by running:

```
serverless deploy
```

After running deploy, you should see output similar to:

```bash
Deploying sickkids-pts to stage dev (ca-central-1, "sickkids-serverless-user" provider)
✔ Your AWS account is now integrated into Serverless Framework Observability
✔ Serverless Framework Observability is enabled

✔ Service deployed to stack sickkids-pts-dev (106s)

dashboard: https://app.serverless.com/sodiumna/apps/aws-sickkids-pts/sickkids-pts/dev/ca-central-1
endpoints:
  ANY - https://xbs8qyjek5.execute-api.ca-central-1.amazonaws.com/dev/users/{param+}
  ANY - https://xbs8qyjek5.execute-api.ca-central-1.amazonaws.com/dev/admin-cognito/{param+}
  ANY - https://xbs8qyjek5.execute-api.ca-central-1.amazonaws.com/dev/admin/{param+}
functions:
  user-api: sickkids-pts-dev-user-api (21 MB)
  admin-cognito-api: sickkids-pts-dev-admin-cognito-api (21 MB)
  admin-api: sickkids-pts-dev-admin-api (21 MB)
```

Take note of the three endpoints you see because these will need to be used in the configuration of the mobile and web app. If you make any changes to the backend, you will need to start from step 2 again.

*Note*: This deployment does not override the database. If you made database schema changes, you must go into your AWS management console and delete the database, and then start from step 2 again. You will lose all the data currently in the database during this process.

## Creating an Admin Account

Make sure your region is on ca-central-1

After you have deployed your backend and web app, it is important to create an admin account so you can register devices in the mobile app and login to the web dashboard. This project leverages AWS Cognito to provide authentication services in this respect. To create an account in Cognito, navigate to the Cognito service and you should see a list of user pools. Click on the one that begins with "sickkids-pts-admin" and scroll down until you see "Users" Create a new user by providing the email address of the user and setting or generating a temporary password. Once complete, you can go to the web app and login with these credentials.

## Accessing the Database Directly

Make sure your region is on ca-central-1

It is possible to directly connect to the database after you have deployed and run SQL queries directly. To do so, you will need to login to the AWS management console and navigate to the RDS service. From there, you should see a *Databases* tab on the left-hand side. Clicking on this tab will bring you to a list of all the databases currently in your account, click on the one that begins with "sickkids-pts-dev" and scroll down until you see "Security group rules" Click on the inbound security group rule and either add a new security group or modify the existing one by adding a new inbound rule. Regardless, you will have to add a new rule, which should allow traffic on all ports from your source IP.

## Configuring Security Controls

Make sure you region is on ca-central-1

When you want to shift your API and database to production, you must ensure that it is secure.
1. Remove direct database access if you configured it above.
2. Navigate to the Lambda service and you should see a list of functions listed. Click on the admin-api function and go to the *Configuration* tab. Click on the *VPC* tab and add a VPC while selecting all available subnets. Choose the default VPC security group which will allow traffic from all sources.
3. Repeat step 2 with the user-api function. Do not perform step 2 for the other Lambda functions.
4. Navigate to the VPC service and click on "Security Groups" Add a new security group for your database and set the inbound rule to only allow traffic from the default security group's ID. This step is crucial as it restricts access to the database to the backend API which is public.

There is a lot more you can do with security groups, so we recommend familiarizing yourself more with how they work through the official [docs](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) and other resources on the internet.

# Directory Structure

There are various key components and modules you need to know in order to understand how we have implemented the backend. Some of which we have mentioned in passing already, such as package.json, tsconfig.json, and serverless.yml. An important directory to be aware of is the *dist* directory which is where the compiled Typescript resides. When we deploy the application using serverless, it is configured to deploy whatever is in *dist*.

The most important directories to know are the ones contained in *src*. There are three which we will go over individually.
- *database* contains db.ts which initializes a Postgres database and all of the SQL table schemas for said database.
- *lambdaFunctions* contains three files, each one corresponding to a major endpoint. For example, admin-endpoints.ts contains the code that handles any requests made to the admin/ endpoint and any of its sub-endpoints like admin/readings/
- *utils* contains a mixture of files containing helper functions that files in *database* and *lambdaFunctions* depend on.

If you want to make a database change, you will need to make a change in *database* and if you want to make an API change, you will need to make a change in *lambdaFunctions*.
