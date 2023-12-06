# Admin Website
This is the website for admin/researchers to monitor and collect data for the patients and their devices, using [React](https://reactjs.org/).

## Current Deployment
https://mellifluous-biscochitos-ab7247.netlify.app/

## Deployment Instructions
- Have `npm` installed
- Create a `.env` file at the root level of this website directory with necessary variables after you have deployed the backend. We will list out these variables now:
   - REACT_APP_ADMIN_BACKEND: Change this to the URL of the admin/ endpoint.
   - REACT_APP_COGNITO_BACKEND: Change this to the URL of the admin-cognito/ endpoint.
   - REACT_APP_ADMIN_USER_BACKEND: Change this to the URL of the user/ endpoint.
   - REACT_APP_REGION: Change this to "ca-central-1"
   - REACT_APP_COGNITO_USER_POOL_ID: Navigate to the Cognito service in your AWS management console where you will see a list of user pools. Change this constant's value to what is specified under the "User pool ID" column for the user pool beginning with "sickkids-pts-admin"
   - REACT_APP_COGNITO_USER_POOL_CLIENT_ID: Click on the user pool that we navigated to above, and then click on the *App Integration* tab. Scroll down until you see "App clients and analytics" where you should see an app client. Change this constant's value to what is specified under the "Client ID" column.

   Here's an example .env:

   ```bash
   REACT_APP_REGION=ca-central-1
   REACT_APP_COGNITO_USER_POOL_ID=ca-central-1_NZlWWBBKg
   REACT_APP_COGNITO_USER_POOL_WEB_CLIENT_ID=27acm70ngeh0p5kkf5qruvbtbo
   REACT_APP_ADMIN_COGNITO_BACKEND=https://plypo4itv8.execute-api.ca-central-1.amazonaws.com/dev/admin-cognito

   # FOR DEVELOPMENT
   REACT_APP_USER_BACKEND=https://plypo4itv8.execute-api.ca-central-1.amazonaws.com/dev/users
   REACT_APP_ADMIN_BACKEND=https://plypo4itv8.execute-api.ca-central-1.amazonaws.com/dev/admin
   ```

Do not commit this `.env` file. You can now proceed with the rest of the steps.

1. Install packages with
   ```
   npm install
   ```
2. Ensure `Netlify CLI` is installed with:
    ```
    npm install -g netlify-cli
    ```
3. Login to your `Netlify` account using:
    ```
    netlify login
    ```
4. `cd` to your project directory(`/website`), initialize your site with:
   ```
   netlify init
   ```
5. Create a new site with:
   ```
   netlify sites:create
   ```
6. Deploy the site to production using:
   ```
   netlify deploy --prod
   ```
7. Set the environment variables in Netlify using your `.env` file:
   ```
   netlify env:import .env
   ```

## Features Implemented (as of December 2023)
- SK-3: Configuring questionnaire frequency
  - Admin can configure the questionnaire frequency by clicking the edit device button in the device detail page
- SK-4: Alert researchers when participants have connectivity issues
  - A pop-up notification will appear when admin has been navigated to the device detail page, informing the admin the device has not been sync for more than 24 hrs.
- SK-6: Change reading interval
  - Admin can change the reading interval of the device by clicking the edit device button in the device detail page

## Testing

to run the automated tests on terminal, do:
- `npm install`
- `npx cypress run`

to run the automated tests with a GUI, do:
- `npm install`
- `npx cypress open`
- `click the E2E test option`
- `click the test that you want to run`


## Directory Structure
- `/cypress`: Automated testing for the website
- `/src`:
  - `/api`: APIs to fetch/update data from the backend
  - `/components`: Components use across several sites
  - `/features`: Main directory of functionalities for the website
  - `/utils`: Helper functions