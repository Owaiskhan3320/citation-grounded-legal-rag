# Deployment

## Deployment model

This project is a static site. It has no production Python server, database, Ollama instance, or API key. Search runs in the visitor's browser against curated files published with the site.

Cloudflare Pages is the recommended host because it serves static assets without an application server that sleeps after inactivity.

## Publish with Cloudflare Pages

1. Create a new public GitHub repository named `consumer-law-research`.
2. Push the local `main` branch to that repository.
3. In Cloudflare, open **Workers & Pages** and choose **Create application** > **Pages** > **Connect to Git**.
4. Select the GitHub repository.
5. Use no framework preset. Set the build command to `exit 0` because the project is already static HTML, CSS, and JavaScript.
6. Set the build output directory to `.` so Pages publishes the repository-root `index.html` and its static assets.
7. Deploy the `main` branch.
8. Open the generated `pages.dev` URL and test the three example searches.

Cloudflare creates a production deployment for `main` and preview deployments for pull requests. Do not add raw judgment files, private review notes, or API secrets to the repository.

## Pre-deployment checklist

- Run `python -m unittest discover -s tests -v`.
- Run `node scripts/test-search.mjs`.
- Confirm the homepage displays on a mobile-sized browser window.
- Check every published statute card links to an official primary source.
- Confirm judgment search only uses reviewed, version-labelled records.
- Add the deployed URL and one interface screenshot to the README.
