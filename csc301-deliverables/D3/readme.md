​Here is a link to the deliverable 3 release in the partner repository where the code is stored: https://github.com/PCIGITI/Smart-Socks-CSC301/releases/tag/D3

Video Demo link: https://www.youtube.com/watch?v=j05wIKuA3-E

## Description of the project

The project aims to create a mobile app serving as a gateway between a medical device and the backend server, offering users insights into sensor data and providing researchers with near real-time device data. Additionally, a web application will enable researchers to view, and export data in CSV format, and potentially adjust parameters such as reading interval.

The goal is to facilitate a comparison between user-reported data and actual usage data of compression garments for managing PTS and enhancing patient compliance. The current app faces rate-limiting issues, particularly during calibration, restricting data transmission to the backend and not sending self-reported survey data.

## Key Features
- **Bluetooth Connectivity**: Users can connect their wearable device to the app via Bluetooth.
- **Battery Health Display**: The app displays the battery health of the connected wearable device.
- **Heart Rate Display**: The app displays the wearer's current heart rate
- **Device and Patient Registration**: Admins in the mobile app can register new devices and patients, which are persisted in a database.
- **Sensor data storage**: Sensor data, such as the battery level, timestamp, and sensor status are regularly sent to the backend and stored in a database.
- **Admin Dashboard**: Admins/Researchers are able to see a bird's eye view of all the registered devices and patients and their associated reading logs. Admins can also configure the sensor data reading interval, disable patients, export readings log tables into CSV tables, change device names, and also modify the frequency of the questionnaires.

## Instructions for end users
- For a patient, they first enable Bluetooth on their phone and open this app. On the main page, click connect to the device put the hardware close to the phone, and wait for prompts.
- Once connected, the user will be presented with the device's battery health and their live heart rate.
- For admins, they can log in via 'Settings' and then log in.

## Deployment process and build preview
### Mobile Deployment:
#### Set up:
  - First, ensure that you have the Expo's EAS CLI command line app installed. If not, you can run `npm install -g eas-cli` in the app directory to acquire it.
  - Also create an account on Expo Go, you will be prompted to sign in when interacting with the CLI.
#### Android:
  - For Android, simply run `eas build --profile preview --platform android`. This command will start the build.
  - If the build is successful, after a while the CLI will return a QR code that will direct you to a link where you can install the APK on your Android phone. Alternatively, you can also input the url they provided into your phone's browser. The build should also be saved into your EAS account where you can access it anytime.
#### IOS:
  - For IOS, it requires more steps and also requires you to have enrolled in Apple's developer program, which charges a fee. For this reason, we do not have an iOS build.

### Backend Deployment
The backend leverages AWS and Serverless. Start off by creating an account for both, and then link your AWS account to your Serverless account. Then download severless cli and run `serverless` command to login.

- CD into the backend directory and run `serverless deploy`
- CLI will return the backend endpoint

### Admin Website Deployment
- Make sure you have netlify cli globally installed (`npm install -g netlify-cli --save-dev`) and a netlify account created
- Inside the website directory run `netlify login` to connect your repo to your netlify account
- Then, create a website using `netlify sites:create`
- Finally, deploy your website using `netlify deploy`

### Build Preview
We have provided URLs below to access our builds.

#### Android
  - The APK for the Android build can be accessed in the link here: https://expo.dev/accounts/sodiumna/projects/sickkids-pts/builds/2cdf5f87-a388-4b2a-b41e-eaa502eb50c5
  - If you have an Android device, you can simply install the APK on your phone and open it from there.
  - Alternatively, you can also simply drag and drop the APK file into your Android Studio emulator. The installation should begin automatically.

#### Website
- The link: https://mellifluous-biscochitos-ab7247.netlify.app/

#### Android
- First, navigate to 'Settings' and enter the credentials provided above
- Without a physical device in hand there's not much that can be done with the app besides navigating its UI
- Admins are able to register new devices, while non-admins cannot

#### Website
- Login to the website via the credentials provided
- The website presents you with an admin dashboard that allows you to see all the devices, admins, and patients
- The "Devices" tab displays all the registered devices. Clicking on a row will navigate you to a different webpage that displays further details of the device, as well as the ability to Edit and Export the Readings table (that is being shown) to CSV. Please be mindful to not click on Disable Device, as this action is irreversible and you will need to re-register with it.
- The "Admin" tab displays all the registered admins that have access to the admin dashboard.
- The "Patients" tab displays all the registered patients. Similar to "Devices", clicking on a row will navigate to a new webpage that gives further detail on the patient. In this new webpage, you will presented with a Readings table associated with the patient. Although there are graphs displayed, they are currently unresponsive.

## Deployment and Github Workflow

### Git/GitHub workflow
- **Branching Strategy**: Team members will create feature branches off the main branch.
- **Commits**: Make small, single-purpose commits, with short, detailed messages that outline the changes they made. More info on git commit best practices [here](https://gist.github.com/luismts/495d982e8c5b1a0ced4a57cf3d93cf60).
- **Pull Requests (PRs)**: Upon completion, the developer will create a PR against the main branch for the feature they worked on. The PR title and description should be descriptive, outlining the changes made.
- **Code Review**: PRs must be reviewed by at least one other team member as part of the merge-in process. The reviewer checks for code quality, and adherence to standards, and tests the new feature.
- **Conflict Resolution**: If conflicts arise during PRs, they are resolved by the developer in coordination with the team member whose code has a conflict, ensuring smooth merges.
- **Merging**: After approval, the developer merges the PR. The main branch is then tested to ensure stability.

### Backend:

#### Process:
- Developers write and test code in local environments, adhering to the project’s coding standards.
- They push the changes to feature branches and create PRs against the main branch on GitHub.
- After peer review and resolving any conflicts, the PRs are merged.
- Developers run `serverless deploy` from the backend directory to deploy the updated backend to AWS.

#### Tools Used:
- **Serverless**: Handles the AWS deployment, setting up AWS CloudFormation.
- **AWS CloudFormation**: Deploys all necessary resources, including AWS RDS for the database, AWS Lambda for functions, AWS Cognito for authentication, and AWS API Gateway for creating REST API endpoints.

### React Native:

#### Process:
- Developers utilize React Native and Expo for app development and testing.
- Once the feature is complete and tested, changes are pushed, and PRs are created and reviewed.
- After merging, Expo builds the application bundles.
- The updated app is then submitted to app stores.

#### Tools Used:
- **React Native**: Used for building the mobile app.
- **Expo**: Handles native functionalities and facilitates the build process for app store submissions.

### React Website Deployment Workflow:

#### Process:
- The website is developed using React, with styling from the MUI library.
- Developers follow a similar Git workflow: writing code, pushing changes, creating PRs, and merging after review.
- AWS Amplify is used for deploying the updated website and for communication with the backend.

#### Tools Used:
- **React**: Front-end framework for building the web.
- **MUI Library**: UI framework that facilitates styling.
- **AWS Amplify**: Manages deployment and enables secure communication with the backend.

#### Justification
The current state of the project was already implemented using the tools described, so we will continue using those. The list of tools may subject to change depending on our needs as the project progresses.

We chose this GitHub workflow to facilitate a collaborative, and stable development environment.
- The branching strategy ensures organized, isolated development for each feature.
- Small, purposeful commits enhance code traceability and manageability.
- Pull Requests serve as structured, well-documented checkpoints for introducing changes.
- Mandatory code reviews by peers uphold coding standards and promote shared responsibility.
- Conflict resolution is approached collaboratively, minimizing disruptions during merges, and the post-merge testing of the main branch ensures the stability of the codebase.

## Coding Standards and Guidelines

- Since the primary language of this project will be Typescript. We will stick to the regular typescript conventions such as camelCase variable and function names and general coding conventions such as keeping each function less than 100 lines.

## Licenses
- Apache Version 2.0
  - Our partner has allowed us to make this project open-source, so we used Apache (open-source license)
