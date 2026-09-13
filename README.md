# Ayuna Nxtools

This project provides various tools for **[nx](https://nx.dev)** tool based monorepo management.

## AyunaIO Scaffold tool

This tool is created as a nx plugin to provide generators for golang (*go.mod based*), python (*uv based*) and typescript (*pnpm based*) projects.

**Please refer to [ayunaio-scaffold](tools/scaffold/README.md) documentation for details of installing and using the tool**.

The following commands in this section are only for local development of the tool. Install [pnpm](https://pnpm.io/installation#on-posix-systems) and [Nx tool](https://nx.dev/docs/getting-started/installation) tool, if not already done. Then, run

```bash
# Install nx dependencies
pnpm clean && pnpm install

# Build the scaffold plugin containing generators for local dev / testing
pnpm nx build scaffold
```

## General usage of nx

Follow sections provide general overview of using nx.

* **To build a library or application project use**

    ```bash
    # Build a specific project
    pnpm nx build <project-name>

    # Build all affected projects
    pnpm nx affected -t build
    ```

* **To run any task with Nx use**

    ```bash
    # Run a specific target in a project
    pnpm nx run <project-name>:<target>

    # For example, to lint or test a project
    pnpm nx lint <project-name>
    pnpm nx test <project-name>
    ```

    These targets are either [inferred automatically](https://nx.dev/docs/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

    [More about running tasks in the docs &raquo;](https://nx.dev/docs/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

* **To version and release the library use**

    ```bash:
    npx nx release
    ```

    Pass `--dry-run` to see what would happen without actually releasing the library.

    [Learn more about Nx release &raquo;](https://nx.dev/docs/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

* **To keep TypeScript project references up to date**

    Nx automatically updates TypeScript [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) in `tsconfig.json` files to ensure they remain accurate based on your project dependencies (`import` or `require` statements). This sync is automatically done when running tasks such as `build` or `typecheck`, which require updated references to function correctly.

    To manually trigger the process to sync the project graph dependencies information to the TypeScript project references, run the following command:

    ```sh
    npx nx sync
    ```

    You can enforce that the TypeScript project references are always in the correct state when running in CI by adding a step to your CI job configuration that runs the following command:

    ```sh
    npx nx sync:check
    ```

    [Learn more about nx sync](https://nx.dev/reference/nx-commands#sync)

## Set up CI (non-Github Actions CI)

**Note:** This is only required if your CI provider is not GitHub Actions.

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/docs/features/ci-features?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/docs/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## 🔗 Learn More

* [Nx Documentation](https://nx.dev/docs)
* [Crafting Your Workspace Tutorial](https://nx.dev/docs/getting-started/tutorials/crafting-your-workspace)
* [Module Boundaries](https://nx.dev/docs/features/enforce-module-boundaries)
* [Releasing Packages](https://nx.dev/docs/features/manage-releases)
* [Nx Plugins](https://nx.dev/docs/concepts/nx-plugins)
