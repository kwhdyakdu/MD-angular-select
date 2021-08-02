<!-- omit in toc -->
# modamatch ☑️ - Deployment

This is a list of things to do when deploying to production environment

<!-- omit in toc -->
## Table of Contents
- [Planning](#planning)
- [Checklist](#checklist)

## Planning
- Modamatch app domain ownership:
  - Checklist assumes QM host it at `modamatch-prod.qmo.io`
- Modamatch app ownership:
  - Checklist assumes QM host
- Wordpress domain ownership:
  - Checklist assumes QM hosts it manually with cloudflare
- Wordpress app ownership:
  - Checklist assumes we're creating a new account on bluehost (emails, payment, etc can change over to client after)
- Contentful and Mongo db account ownership:
  - Checklist assumes we're creating a new account on contentful/mongodb

## Checklist
- Modamatch setup
  - Update infra folder with `prod` deployment
  - Create new modamatch domain :
    - Not the same as client domain name.
    - For internal `<client-env>.qmo.io` domains, use project-mob (which interfaces with cloudflare automatically)
  - Clone mongodb instance
    - There should be some clone or export / import functionality on the mongodb atlas interface
  - Set up new contentful space and optional new account
    - Create new prod account
    - Install cli: `yarn global add contentful-cli`
    - Authenticate with staging contentful: `contentful login`, browser will open.
    - Export contentful space data: https://www.contentful.com/developers/docs/tutorials/cli/import-and-export/
      - `contentful space export --space-id <space-id> --environment-id <dev> --skip-roles --content-file contentful-export.json`
    - If same space, you can skip this step: Authenticate with prod contentful: `contentful login`, browser will open.
    - Import contentful space data: 
      - `contentful space import --space-id <space-id> --environment-id <dev> --skip-content-publishing --content-file  contentful-export.json`
      - Do not publish any imported data at this point
      - Setup "webhooks" on import's contentful space, using the correct `url` and `secret`
      - Setup "api keys" on import contentful space, copy down api `space id` and `Content Delivery API - access token` for use in next js
      - Update contentful staging store entry, should reflect new wordpress domain.
      - Once both webhooks and api keys are setup, publish all content.
  - Clone Buddy.works pipeline
    - Use staging as a base, replace all `staging` strings with `prod`
    - Update all variables with new values from earlier steps
  - Deploy new next js instance for prod
    - Use project mob to do this
- Wordpress setup
  - Set up wordpress domain
    - For public `<client>.<domain>` domains, use cloudflare directly (reach out to Erich for this)
  - Set up DNS with bluehost:
    - If we can find the static IP, we can use cloudflare's DNS services to point our new domain's A record to the static ip
    - If we cannot, we have to change the domain's nameserver (DNS server) to use Bluehost's instead
      - Typically three nameservers.
      - Find these at bluehost's support docs.
      - Go to domain registrar, they have a nameserver setting for each domain
    - Optional: Set up `www` subdomain CNAME record to point to `<client>.<domain>`
  - Set up HTTPS certs
    - Research: See if bluehost supports letsencrypt. If not, we have to buy a SSL cert (reach out to Erich)
  - Set up wordpress host:
    - Now that DNS and HTTPs is set up, we can proceed with wordpress installation
    - Use the domain we just set up as domain name
    - Set up wordpress as is.
  - Set up wordpress plugins and content using a backup (OPTION 1 of 2) 
    - Use 'Updraft plus' plugin to create a entire backup of the staging site
    - Use 'Updraft plus' plugin to restore backup onto new site
    - Updraft plus *should* be able to update domain names in the backup to the new one
    - Update webhooks immediately after restore to point to prod modamatch domain name
    - with Bluehost's C-panel filesystem client, edit `wp-plugins/woocommerce-modamatch/index.php`, edit the store-id in `woocommerce/<shop-id>`, replace with wordpress domain name.
  - Set up wordpress plugins and content from scratch (OPTION 2 of 2) and
    - Complete wordpress initial setup
    - Visit plugins, install `woocommerce` plugin
    - Disable and delete all other unused plugins
    - Complete woocommerce initial setup, taking care of store location, timezone and currency
    - Using bluehost cpanel, upload `woocommerce-modamatch` plugin to `wp-plugins` folder
    - Using bluehost cpanel, edit `index.php` of the plugin, update `store-id` to the current wordpress domain
    - Set up webhooks with the modamatch woocommerce products webhook endpoint
    - Visit staging site, do a CSV export of the products
    - Visit prod site, do a CSV import of the products
      - Ensure product id's DO NOT CHANGE during the import process. Imported site's products must have the same id as the exporting site.
      - If id's have changed, must go through each contentful item and update the corresponding product ID with the changed ID
    - Client: Reupload all assets for each product
