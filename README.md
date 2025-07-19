This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) and configured for [Cloudflare Pages](https://pages.cloudflare.com/).

## Getting Started

This project uses **pnpm** as the package manager. First, run the development server:

```bash
pnpm dev
```

> **Note**: You may see a warning about multiple lockfiles due to a `package-lock.json` in a parent directory. This can be safely ignored as the project is configured to use pnpm.

## Cloudflare Pages Deployment

### Manual Deployment

This project is configured to deploy on Cloudflare Pages with the Edge Runtime:

```bash
# Build for Cloudflare Pages
pnpm pages:build

# Preview locally with Wrangler
pnpm pages:preview

# Deploy to Cloudflare Pages
pnpm pages:deploy
```

### Automatic Deployment with GitHub Actions

This project includes GitHub Actions for automatic deployment when you push to the `main` branch.

#### Setup Instructions:

1. **Get your Cloudflare API Token:**
   - Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Click "Create Token"
   - Use the "Cloudflare Pages:Edit" template
   - Or create a custom token with these permissions:
     - `Account:Cloudflare Pages:Edit`
     - `Zone:Zone Settings:Read`
     - `Zone:Zone:Read`

2. **Get your Cloudflare Account ID:**
   - Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Copy the Account ID from the right sidebar

3. **Add GitHub Secrets:**
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Add these repository secrets:
     - `CLOUDFLARE_API_TOKEN`: Your API token from step 1
     - `CLOUDFLARE_ACCOUNT_ID`: Your account ID from step 2

4. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add GitHub Actions deployment"
   git push origin main
   ```

The workflow will automatically build and deploy your app to Cloudflare Pages on every push to the `main` branch!

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Test change

🎉 \*_GitHub Actions deployment workingrun watch_ - Deployed automatically on Sat Jul 19 12:38:47 +04 2025
