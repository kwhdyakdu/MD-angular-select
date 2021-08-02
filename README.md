<!-- omit in toc -->
# modamatch 👕

Clothing try-on plugin for Shopify & Woocommerce. This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/zeit/next.js/tree/canary/packages/create-next-app).

<!-- omit in toc -->
## Table of Contents
- [Getting Started](#getting-started)
  - [Instructions](#instructions)
  - [Develop and test the shopify installation locally](#develop-and-test-the-shopify-installation-locally)
- [App Concepts](#app-concepts)
  - [How does it work?](#how-does-it-work)
  - [Development Environments](#development-environments)
  - [Contentful Migration - Import, Export, Webhooks, API](#contentful-migration---import-export-webhooks-api)
  - [Storefront Migration - Import, Export, Webhooks, API](#storefront-migration---import-export-webhooks-api)
  - [Testing best practices](#testing-best-practices)
- [General Concepts](#general-concepts)
  - [Learn More](#learn-more)
  - [Deploy on Vercel](#deploy-on-vercel)

## Getting Started

### Instructions

- Ask for local `.env` file from team member
- First, run the development server `yarn dev`
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
- You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

### Develop and test the shopify installation locally 

`local-modamatch-partner.myshopify.com` is setup to load the embed script through the dev environment, but still use `localhost:3000` for the iframe content.

This allows local development without having to setup a separate app for localhost in shopify. 

If changes need to be made to the oauth procedure (`/src/pages/api/auth/shopify`) or the embed script (`/src/scripts/shopify-embed`) further steps are necessary:

- Start a public server with `yarn ngrok` and note the url (Must start with `https://`)
- Create a new app in shopify (https://partners.shopify.com/)
  - Use `https://{ngrok-url}/api/auth/shopify` as app url
  - Use `https://{ngrok-url}/api/auth/shopify/callback ` as redirect url (replace `{ngrok-url}` with the url noted in the last step)
- Install the app in an empty test store (`Test your app` section in your app page)
- Follow the install instructions

If you restart ngrok, it will generate a new url and you'll need to update the app url and redirect url of your app accordingly


## App Concepts

### How does it work?
- Storefront integration
  - Our Next js instance (`./src`) is a app that runs alongside storefronts (shopify, woocommerce). Each instance can support multiple stores, and typically only one instance per environment type (dev, staging, prod)
  - Custom modamatch plugin (`./wordpress`) for shopify / woocommerce adds client instructions, embed script inject, and in the future, client settings panel
  - Embed Scripts (`/src/scripts`) creates an iframe modal and button, and adds `postMessage` messaging between iframe parent and iframe content scopes
  - Iframe target is our Next Js instance shopify or woocommerce page `./src/pages/[storeType]/index.ts`
  - Our app uses `postMessage` to interact with the store's function & data, control iframe state, and call store apis.
- Product integration
  - Contentful and storefronts (shopify / woocommerce) both contain webhooks. 
  - On content publish or product changes (publish, unpublish, modification), webhooks call our Next js instance. 
  - Our instance normalizes the data and publishes it to our mongo db.
  - Mongo db is our application's main data source

### Development Environments
- Shopify - Local: https://local-modamatch-partner.myshopify.com/admin (id: common+modamatch@qmo.io, like dev but for debugging)
- Shopify - Dev: https://dev-modamatch-partner.myshopify.com/admin (id: common+modamatch@qmo.io)
- Shopify - Staging: https://staging-modamatch-partner.myshopify.com/admin (id: common+modamatch@qmo.io)
- Woocommerce Admin - Dev & Staging : https://my.bluehost.com/hosting/app/#/sites/ (id: qmo.io, for QM only)
- Woocommerce - Staging: http://box5177.temp.domains/~qmoio/staging/wp-admin (id: common_modamatch, for client only)
- Mongo DB Atlas - Dev: https://cloud.mongodb.com/v2/5fc91c3794b5464d294a909c#clusters (ask for invite)
- Mongo DB Atlas - Staging: https://cloud.mongodb.com/v2/5fd12999a3ae2b7ef86dc6ec#clusters (ask for invite)
- Contentful - Dev: https://app.contentful.com/spaces/vbza3klgx1vq (ask for invite)
- Contentful - Staging: https://app.contentful.com/spaces/zgqhwjb2hxrm (common+modamatch@qmo.io or ask for invite)

### Contentful Migration - Import, Export, Webhooks, API
- For prod deployment, see `DEPLOYMENT.MD`
- Install cli: `yarn global add contentful-cli`
- Authenticate with contentful: `contentful login`, browser will open.
  - For best experience, ensure this user is added to both import and exporting contentful spaces.
- Export contentful space data: https://www.contentful.com/developers/docs/tutorials/cli/import-and-export/
  - `contentful space export --space-id <space-id> --environment-id <dev> --skip-roles --content-file contentful-export.json`
- Import contentful space data: 
  - `contentful space import --space-id <space-id> --environment-id <dev> --skip-content-publishing --content-file  contentful-export.json`
  - Do not publish any imported data at this point
- Setup "webhooks" on import's contentful space, using the correct `url` and `secret`
- Setup "api keys" on import contentful space, copy down api `space id` and `Content Delivery API - access token` for use in next js
- Once both webhooks and api keys are setup, publish all content.

### Storefront Migration - Import, Export, Webhooks, API
- Set up webhooks on importing store
- Use each store's import and export to csv function 
- Ensure product id's DO NOT CHANGE during the import process. Imported site's products must have the same id as the exporting site.
  - This is because contentful references the products by their ids. If it changes during import, you must update the relevant product on contentful.
  - On Woocommerce: This is shown when you hover over a product or url (EX: http://box5177.temp.domains/~qmoio/staging/wp-admin/post.php?post=10&action=edit)
  - On Shopify: This is shown on the url (EX: https://local-modamatch-partner.myshopify.com/admin/products/6118105219249)

### Testing best practices

QA should be involved starting at the very early stages of any projects. In order to make the QA landing smoothly on projects, there are some best practices should be applied:

- Testing accounts: QA needs to have privileges or permissions to access those resources prior starting any projects:
  - Jira or HP ALM: Test management and defect tracking tools in order to support creating, executing test cases (TC)/User stories (US) and tracking bugs/defects.
  - Google cloud platform (GCP), Bitrise and Github: if they are applicable. QA needs to have a document which has all necessary information should be addressed that QA could access to set up on their machine.
  - Database: need to create guidelines how to setup DB on QA machine or address where QA could access to launch DB.
- Testing tools:
  - Postman: if it is applicable to test API (web services). It has been provided by QM, so QA should be provided an account to access its resources.
  - BrowserStack: it has been provided by QM, so QA needs an account to access it in order to test web app/mobile app on simulate devices. Here is BrowserStack Demo on Core-Next project: https://www.loom.com/share/ffd6fc897c504badad4d09269f72175a
  - Jest and CI/CD: unit testing and circleci demo: https://www.loom.com/share/71dbb963d5e644dba59316c8f14f2c12
- Testing devices: IOS and Android devices for mobile testing.
  - IOS: developer must add IOS testing devices into developer apple profile then download certificate which includes IOS testing devices. Finally, developer must used certificate downloaded to build the app in order to let QA could install the app on the registered IOS testing devices.
  - Android: doesn’t need above steps, QA just simply copy .apk file and install it on testing devices.


## General Concepts

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/zeit/next.js/) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
