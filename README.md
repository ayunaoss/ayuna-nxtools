# ayuna-nxtools

[![GitHub license](https://img.shields.io/github/license/ayunaoss/ayuna-nxtools.svg?style=flat-square)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/ayunaoss/ayuna-nxtools.svg?style=flat-square)](https://github.com/ayunaoss/ayuna-nxtools/issues)

> An open-source collection of developer automation tools, generators, and plugins for modern [Nx](https://nx.dev) monorepo workspaces.

---

## Packages

All tools in this repository are published independently under the `@ayunaio` scope on npm:

| Package                                                                | Version                                                                                                                         | Description                                                       | Source                                       |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| [`@ayunaio/scaffold`](https://www.npmjs.com/package/@ayunaio/scaffold) | [![npm](https://img.shields.io/npm/v/@ayunaio/scaffold.svg?style=flat-square)](https://www.npmjs.com/package/@ayunaio/scaffold) | Multi-language workspace generators and synchronization executors | [`tools/scaffold`](tools/scaffold/README.md) |
| *More tools coming soon*                                               | —                                                                                                                               | Additional developer utilities for Nx workspaces                  | `tools/*`                                    |

---

## Workspace Architecture

`ayuna-nxtools` provides standardized plugins and automation to reduce monorepo maintenance overhead across polyglot teams:

* **Opinionated Scaffolding:** Generate ready-to-code project templates configured for modern tooling stacks.
* **Workspace Lifecycle Automation:** Automate common monorepo tasks like multi-language synchronization, cache purging, and interface builds.
* **Seamless Nx Integration:** Designed natively around Nx plugins, generators, and executors.

---

## Local Development & Contributing

This section is for contributors developing within the **ayuna-nxtools** monorepo itself.

### Prerequisites

* [Nx CLI](https://nx.dev/docs/getting-started/installation)
* [pnpm](https://pnpm.io/installation)

### Setup

```bash
# Clone the repository
git clone https://github.com/ayunaoss/ayuna-nxtools.git
cd ayuna-nxtools

# Install all workspace dependencies
pnpm clean && pnpm install

# Build all packages
pnpm nx run-many -t build

# Build a specific package (e.g., scaffold)
pnpm nx build scaffold
```
