# Ayuna Nxtools

**ayuna-nxtools** is an open-source suite of developer utilities designed for modern workspaces using **[nx](https://nx.dev)**. Its primary component, **@ayunaio/scaffold**, provides rapid project and module scaffolding to standardize development workflows across your team.

* **GitHub Repository:** [ayunaoss/ayuna-nxtools](https://github.com/ayunaoss/ayuna-nxtools)
* **npm Package:** [@ayunaio/scaffold](https://www.npmjs.com/package/@ayunaio/scaffold)

## ayuna-nxtools · @ayunaio/scaffold

[![npm version](https://img.shields.io/npm/v/@ayunaio/scaffold.svg?style=flat-square)](https://www.npmjs.com/package/@ayunaio/scaffold)
[![npm downloads](https://img.shields.io/npm/dm/@ayunaio/scaffold.svg?style=flat-square)](https://www.npmjs.com/package/@ayunaio/scaffold)
[![GitHub license](https://img.shields.io/github/license/ayunaoss/ayuna-nxtools.svg?style=flat-square)](LICENSE)

> The official repository for **ayuna-nxtools**, providing developer automation and monorepo tooling for Nx workspaces - featuring the **@ayunaio/scaffold** package.

This tool is created as a **nx** plugin to provide project generators for

* golang (*go.mod based, with go 1.27*)
* python (*uv based, with python 3.12*)
* typescript (*pnpm based, with node.js 24*)

For complete details, refer to **[@ayunaio/scaffold](tools/scaffold/README.md)** documentation.

### Installation

**@ayunaio/scaffold** is intended to be installed inside a nx workspace project.

#### Prerequisites

Complete the following steps before proceeding with the plugin installation.

1. Install **[nx](https://nx.dev/docs/getting-started/installation)** tool
2. Install **[pnpm](https://pnpm.io/installation#on-posix-systems)** package manager
3. Initialize the Nx workspace
   1. Create a **[new project workspace](https://nx.dev/docs/getting-started/tutorials/crafting-your-workspace#creating-a-workspace)**, if you are starting from scratch
   2. Turn your **[existing monorepo](https://nx.dev/docs/getting-started/start-with-existing-project)** into Nx workspace project otherwise

#### Install plugin with workspace dependencies

```bash
## Install nx plugin package in the monorepo root
pnpm nx add @nx/plugin

## Install scaffold tool
pnpm add -D @ayunaio/scaffold -w

## Install buf tool
pnpm add -D @bufbuild/buf -w
```

#### Add plugin provided executors

Ensure that the `nx.json` files under the monorepo root contains the following entries.

```json
"targetDefaults": {
    "workspace-sync": {
      "executor": "@ayunaio/scaffold:workspace-sync",
      "cache": false
    },
    "workspace-purge": {
      "executor": "@ayunaio/scaffold:workspace-purge",
      "cache": false
    }
}
```

Ensure that the `package.json` file in the monorepo root contains the following entries.

```json
"nx": {
    "targets": {
      "workspace-sync": {},
      "workspace-purge": {}
    }
}
```

Finally, run the following commands to update the nx workspace for your monorepo.

```bash
pnpm nx affected -t build
pnpm nx sync
```

### Local Development

This section is only for ayuna-nxtools developers, for local development of the tool. Install **[pnpm](https://pnpm.io/installation#on-posix-systems)** and **[Nx tool](https://nx.dev/docs/getting-started/installation)** tool, if not already done.

```bash
# Clone the repository
git clone https://github.com/ayunaoss/ayuna-nxtools.git

# Enter the repo folder
cd ayuna-nxtools

# Install nx dependencies
pnpm clean && pnpm install

# Build the scaffold plugin containing generators
# for local development / testing
pnpm nx build scaffold
```

## 🔗 Nx References

* [Nx Documentation](https://nx.dev/docs)
* [Nx Plugins](https://nx.dev/docs/concepts/nx-plugins)
