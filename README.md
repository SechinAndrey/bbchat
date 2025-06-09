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
npm install
```

<p>3. Run the development server.</p>

```bash
npm run dev
```

<br/>

## Deployment 🚀

This project includes scripts for versioned deployment and rollback functionality.

<p>1. Make deployment scripts executable (only once after cloning):</p>

```bash
# Option 1: Make the prepare script executable first
chmod +x prepare-scripts.sh
./prepare-scripts.sh

# Option 2: Use bash to run without changing permissions
bash prepare-scripts.sh
```

<p>2. Run the setup script to prepare your environment (only once per server):</p>

```bash
./setup.sh
```

<p>3. Build your project:</p>

```bash
npm run build
```

<p>4. Deploy a new version:</p>

```bash
./deploy.sh
```

This will:

- Create a new versioned release (e.g., `1-20230701`)
- Copy files from the `dist` directory to the release folder
- Update the symbolic link to point to the new version
- Keep only the 5 most recent versions

<p>5. If needed, rollback to a previous version:</p>

```bash
# Rollback to the previous version
./rollback.sh

# Rollback to a specific version by number
./rollback.sh 2

# Rollback to a specific version by full name
./rollback.sh 2-20230620
```

<p>6. Configure Nginx for web access:</p>

```bash
# Configure with your IP address (for testing)
./create-nginx-config.sh --ip 192.168.1.100

# Configure with your domain name
./create-nginx-config.sh --name your-domain.com

# Configure with custom port (useful when multiple sites on same server)
./create-nginx-config.sh --ip 192.168.1.100 --port 8080

# Get help
./create-nginx-config.sh --help
```

This will create and install an Nginx configuration file, allowing you to access your application through a web browser. You can start with an IP address for testing and later switch to a domain name when it's available.

<br/>
<br/>

## Development Workflow 🔄

This project follows structured development practices:

### Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/) for standardized commit messages. To make a commit:

```bash
npm run commit
```

This will guide you through creating a properly formatted commit message.

### Versioning

For versioning and changelog generation:

```bash
npm run release
```

This automatically determines the next version based on your commits, updates package.json, and generates a CHANGELOG.md file.

## Resources 📙

<p>The resources used to create this project are:</p>

- <a href="https://www.figma.com/design/afxhPVpXABmGzKPk146vlz/Avian-Messaging-Old?node-id=0-1&t=zUVzLyhGRmDk1KCn-0">Figma file</a>
- <a href="https://pinia.vuejs.org/">Pinia</a>
- <a href="https://heroicons.com/">Heroicons</a>
- <a href="https://github.com/dcastil/tailwind-merge">Tailwind merge</a>
- <a href="https://vueuse.org/">vueuse</a>
- <a href="https://wavesurfer-js.org/">Wavesurfer-js</a>
- <a href="https://github.com/Akryum/floating-vue">floating-vue</a>
- <a href="https://commitizen.github.io/cz-cli/">Commitizen</a>
- <a href="https://github.com/conventional-changelog/standard-version">Standard-version</a>
