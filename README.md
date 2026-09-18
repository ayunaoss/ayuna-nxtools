# Ayuna Nxtools

This project provides various tools for **[nx](https://nx.dev)** tool based monorepo management.

## AyunaIO Scaffold Tool

This tool is created as a nx plugin to provide project generators for

* golang (*go.mod based, with go 1.27*)
* python (*uv based, with python 3.12*)
* typescript (*pnpm based, with node.js 24*)

### Tool Usage

Details on how to install this Nx tool and how to use it to scaffold projects for golang, python and typescript is available at **[ayunaio-scaffold](tools/scaffold/README.md)** page.

### Local Development

The following commands in this section are only for local development of the tool. Install **[pnpm](https://pnpm.io/installation#on-posix-systems)** and **[Nx tool](https://nx.dev/docs/getting-started/installation)** tool, if not already done. Then, run the following commands from ayuna-nxtools project root.

```bash
# Install nx dependencies
pnpm clean && pnpm install

# Build the scaffold plugin containing generators
# for local development / testing
pnpm nx build scaffold
```

## 🔗 Learn More

* [Nx Documentation](https://nx.dev/docs)
* [Crafting Your Workspace Tutorial](https://nx.dev/docs/getting-started/tutorials/crafting-your-workspace)
* [Module Boundaries](https://nx.dev/docs/features/enforce-module-boundaries)
* [Releasing Packages](https://nx.dev/docs/features/manage-releases)
* [Nx Plugins](https://nx.dev/docs/concepts/nx-plugins)
