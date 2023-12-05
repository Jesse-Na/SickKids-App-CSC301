# Admin Website
This is the website for admin/researchers to monitor and collect data for the patients and their devices, using [React](https://reactjs.org/).

## Current Deployment
https://mellifluous-biscochitos-ab7247.netlify.app/

## Deployment Instructions
- Have `npm` installed
- Configure `.env` with necessary credentials

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

## Features Implemented (as of December 2023)
- SK-3: Configuring questionnaire frequency
  - Admin can configure the questionnaire frequency by clicking the edit device button in the device detail page
- SK-4: Alert researchers when participants have connectivity issues
  - A pop-up notification will appear when admin has been navigated to the device detail page, informing the admin the device has not been sync for more than 24 hrs.
- SK-6: Change reading interval
  - Admin can change the reading interval of the device by clicking the edit device button in the device detail page

## Testings

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