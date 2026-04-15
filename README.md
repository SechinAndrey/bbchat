## Features ⚡

This template is packed with a lot of features including:

- [x] Dark and light modes.
- [x] Messages with attachments.
- [x] Replies and pins.
- [x] Conversations and archives.
- [x] Settings.
- [x] Notifications.
- [x] Voice calls.
- [x] Sign in and sign up pages.
- [x] Password reset page.
- [x] and much more.

<br/>
<br/>

## Setup 🔧

Here is how to setup this template:

<p>1. Clone the repository.</p>

```bash
git clone https://github.com/demon-bixia/Avian-Template.git
```

<p>2. Install dependencies.</p>

```bash
yarn install
```

<p>3. Run the development server.</p>

```bash
yarn dev
```

<br/>

## Release & Deployment 🚀

This project uses a TypeScript-based CLI for managing versioned releases, deployments, and rollbacks.

Legacy shell scripts in [scripts/release.sh](scripts/release.sh), [scripts/bump-version.sh](scripts/bump-version.sh), [scripts/deploy-web.sh](scripts/deploy-web.sh), [scripts/build-apk.sh](scripts/build-apk.sh), and [scripts/rollback.sh](scripts/rollback.sh) are deprecated and kept only for temporary backward compatibility.

### Prerequisites

Add required environment variables to `.env`:

```bash
# Server deployment config
DEPLOY_HOST=user@your-server
DEPLOY_PATH=/var/www/bb-chat

# Optional: APK upload endpoint
APK_UPLOAD_URL=https://your-dashboard/api/upload-apk
APK_UPLOAD_TOKEN=your-upload-token
```

`DEPLOY_HOST` and `DEPLOY_PATH` are present in [.env.example](.env.example).
`APK_UPLOAD_URL` and `APK_UPLOAD_TOKEN` are optional and can be added manually if you need APK upload.

### Quick Start: Release & Deploy

#### 1. Prepare Release

Generates changelog, bumps versions, shows preview. No commit yet.

```bash
yarn release prepare 0.9.0
```

**Output:**

- Shows what will be in the commit
- Prints diff of whitelist files
- Saves state for apply step
- Warns if the worktree already contains local changes before the release commit

#### 2. Review & Apply Release

After reviewing the preview, create commit and tag:

```bash
yarn release apply 0.9.0
yarn release apply 0.9.0 --push  # Auto-push after commit
yarn release apply 0.9.0 --yes   # Skip interactive confirmation
```

**Output:**

- Commits whitelist files (`package.json`, `android/app/build.gradle`, `CHANGELOG.md`)
- Creates tag v0.9.0 on release commit
- Optionally pushes to origin

#### 2.1 Revert Prepared Release

If you need to discard prepared changes before apply:

```bash
yarn release prepare-revert 0.9.0
```

#### 3. Deploy Web (Stable or Production)

Builds and deploys to your server:

```bash
# Deploy stable version (for testing)
yarn deploy:web --mode stable

# Deploy production
yarn deploy:web --mode production

# Custom server/path
yarn deploy:web --host user@other-server --path /var/www/other-app --mode production

# Keep last 10 releases instead of 5
yarn deploy:web --keep 10
```

**What it does:**

- Builds with vite (mode: stable|production)
- Creates versioned release dir on server
- Updates symlink to latest
- Cleans up old releases

#### 4. Build Android APK

Assembles debug APK for stable/prod environments:

```bash
# Build stable APK, upload if APK_UPLOAD_URL and APK_UPLOAD_TOKEN set
yarn build:apk stable

# Build prod APK without upload
yarn build:apk prod --no-upload

# Specify custom upload endpoint
yarn build:apk stable --upload-url https://your-upload.example.com/apk
```

**Output:**

- APK saved to `apk-output/stable-0.9.0.apk` or `apk-output/prod-0.9.0.apk`
- Uploaded if URL and token are configured

#### 5. Rollback Web

Revert to previous release or specific version:

```bash
# Rollback to previous version
yarn rollback

# Rollback to specific version
yarn rollback 0.8.2

# Specify custom deployment server
yarn rollback --host user@other-server --path /var/www/other-app
```

### Full Release Workflow Example

```bash
# 1. Prepare (review changes locally)
yarn release prepare 0.9.0

# 2. Apply (create commit and tag)
yarn release apply 0.9.0 --push

# 3. Deploy to stable for testing
yarn deploy:web --mode stable

# 4. Build and upload stable APK
yarn build:apk stable

# 5. After testing, deploy to production
yarn deploy:web --mode production

# 6. Build and upload production APK
yarn build:apk prod
```

### Direct CLI Commands

All commands also available as raw CLI:

```bash
yarn release:cli release prepare <version>
yarn release:cli release prepare-revert <version>
yarn release:cli release apply <version>
yarn release:cli deploy-web [--host ...] [--mode ...]
yarn release:cli build-apk <stable|prod>
yarn release:cli rollback [version]
yarn release:cli help
```

<br/>
<br/>

## Development Workflow 🔄

This project uses a TypeScript release CLI and Yarn-based scripts.

### Useful Script Reference

```bash
yarn release prepare <version>
yarn release prepare-revert <version>
yarn release apply <version> [--push] [--yes]
yarn deploy:web [--mode stable|production] [--host ...] [--path ...] [--keep 5]
yarn build:apk <stable|prod> [--no-upload] [--upload-url URL]
yarn rollback [version] [--host ...] [--path ...]
yarn release:cli help
yarn test:release-cli
```

### Changelog Commands

```bash
yarn changelog
yarn changelog:full
```

`yarn changelog` uses git-cliff with [cliff.toml](cliff.toml) and updates the short changelog in `CHANGELOG.md`.

`yarn changelog:full` uses git-cliff with [cliff.full.toml](cliff.full.toml) and writes the extended changelog to `CHANGELOG.full.md` when you run it manually.

In release flow, `yarn changelog` is executed during `yarn release prepare <version>`.

Release versioning is handled explicitly through `release prepare`, `release prepare-revert`, and `release apply` commands.

## Resources 📙

<p>The resources used to create this project are:</p>

- <a href="https://www.figma.com/design/afxhPVpXABmGzKPk146vlz/Avian-Messaging-Old?node-id=0-1&t=zUVzLyhGRmDk1KCn-0">Figma file</a>
- <a href="https://pinia.vuejs.org/">Pinia</a>
- <a href="https://heroicons.com/">Heroicons</a>
- <a href="https://github.com/dcastil/tailwind-merge">Tailwind merge</a>
- <a href="https://vueuse.org/">vueuse</a>
- <a href="https://wavesurfer-js.org/">Wavesurfer-js</a>
- <a href="https://github.com/Akryum/floating-vue">floating-vue</a>
