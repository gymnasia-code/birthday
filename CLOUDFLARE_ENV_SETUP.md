## Environment Variables Configuration for Cloudflare Pages

### Current Status ✅

Your secrets are properly configured in Cloudflare Pages:

- ✅ NOTION_SECRET
- ✅ POSTER_TOKEN
- ✅ POSTER_TOKEN_CAFE
- ✅ POSTER_TOKEN_PARK
- ✅ SLACK_WEBHOOK_URL

### Environment Variables vs Secrets

**Environment Variables (in `wrangler.jsonc` → `vars`):**

- Non-sensitive values that can be seen in plain text
- Available at build time and runtime
- Examples: API URLs, database IDs, public configuration

**Secrets (set via `wrangler pages secret put`):**

- Sensitive values that are encrypted
- Only available at runtime (not during build)
- Examples: API tokens, webhook URLs, private keys

### Troubleshooting Steps

If environment variables are still not working:

#### 1. Check Runtime Compatibility

Make sure your API routes use the correct runtime:

```typescript
// For routes that need access to secrets
export const runtime = 'edge'
```

#### 2. Verify Build Configuration

Ensure your `next.config.ts` doesn't interfere with environment variable access.

#### 3. Test Environment Access

Visit these URLs after deployment:

- `/api/test/env` - Check all environment variables
- `/debug` - Test integrations

#### 4. Check Deployment Logs

```bash
wrangler pages deployment list --project-name birthday-app
```

#### 5. Redeploy with Latest Configuration

```bash
pnpm pages:build
pnpm pages:deploy
```

### Common Issues & Solutions

#### Issue: Secrets not available during build

**Solution:** Secrets are only available at runtime, not during build. Make sure you're not trying to access secrets in components that run during build.

#### Issue: Environment variables undefined in edge runtime

**Solution:** Ensure you're using `export const runtime = 'edge'` in API routes that need access to environment variables.

#### Issue: Mixed runtime environments

**Solution:** Keep API routes that need secrets in edge runtime, others can use Node.js runtime if needed.

### Next Steps

1. **Deploy your updated code:**

   ```bash
   pnpm pages:deploy
   ```

2. **Test the environment endpoint:**

   ```bash
   curl https://bd.gymnasia.ge/api/test/env
   ```

3. **Check the debug page:**
   Visit https://bd.gymnasia.ge/debug

4. **Monitor for any remaining issues** and check the Functions logs in the Cloudflare dashboard.
