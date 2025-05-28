# Monorise

<!--toc:start-->

- [Monorise](#monorise)
  - [🚀 Features](#🚀-features)
  - [💡 Core Concepts](#💡-core-concepts)
  - [📦 Installation](#📦-installation)
    - [Using npm / yarn / etc](#using-npm-yarn-etc)
    - [Or clone the repo](#or-clone-the-repo)
  - [🛠️ Usage](#🛠️-usage)
    - [Basic Example](#basic-example)
    - [CLI Example (if applicable)](#cli-example-if-applicable)
  - [📄 Documentation](#📄-documentation)
  - [🤝 Contributing](#🤝-contributing)
  - [📂 Folder Structure](#📂-folder-structure)
  - [✅ Roadmap](#roadmap)
  - [🧪 Running Tests](#🧪-running-tests)
  - [🧰 Built With](#🧰-built-with)
  - [Gitflow (How to develop)](#gitflow-how-to-develop)
    - [Main branch](#main-branch)
    - [Dev branch](#dev-branch)
    - [Feature branch](#feature-branch)
  - [📝 License](#📝-license)
  - [🌟 Acknowledgments](#🌟-acknowledgments)
  <!--toc:end-->

Full-stack data framework to simplify Single table design in DynamoDB using graph database principles.

## 🚀 Features

- ⚡ **Blazing Fast O(1) Performance**: Engineered from the ground up for
  single-table design, Monorise guarantees consistent O(1) query performance,
  no matter how complex or large your dataset becomes. Experience the true
  speed of DynamoDB.
- 🧠 **Intelligent Single-Table Design**: Leverage the power of DynamoDB's
  single-table pattern without the headaches. Monorise handles complex access
  patterns and partitioning automatically, so you can focus on your application,
  not your data model.
- 🔄 **Automated Denormalization & Duplication**: Say goodbye to manual data
  synchronization! Monorise intelligently manages data denormalization and
  duplication, ensuring data consistency across your single table with zero
  developer overhead.
- 💡 Intuitive Graph-like Modeling: Model complex relationships with ease
  using our core building blocks:
  - Entity: Define distinct objects and concepts.
  - Mutual: Capture rich, data-bearing relationships between entities,
    supporting many-to-many and stateful interactions.
  - Tag: Attach flexible key-value pairs for powerful classification,
    sorting, and filtering capabilities.
- 👋 **Familiar Relational Database Feel**: Querying your data feels intuitive
  and familiar, much like working with a traditional relational database,
  but with the boundless scalability and speed of a modern NoSQL infrastructure.
- 🚀 **Seamless Full-Stack Integration**: Designed for the modern full-stack
  developer. Our upcoming unified monorise package and SST v3 Super Component
  will streamline your entire development-to-deployment workflow on AWS.
- 🏎️ **Optimized for Serverless**: Built with performance-first principles,
  utilizing lightweight and performant runtimes (migrating to Hono) to ensure
  rapid cold starts and efficient execution in serverless environments.
- 🛡️ **Battle-Tested Reliability**: Enjoy a robust and well-tested framework that
  simplifies complex DynamoDB operations, reducing potential errors and ensuring
  data integrity.
- 📈 **Scalability by Design**: Inherit DynamoDB's infinite scalability, empowered
  by Monorise's optimized data access patterns, allowing your application to grow
  without limits.

## 💡 Core Concepts

- Entity
- Mutual
- Tag

Learn more about these concepts in our [Concepts Guide](docs/CONCEPT.MD).

## 📦 Installation

### Using npm / yarn / etc

```bash
npm install @monorise/core @monorise/cli @monorise/react @monorise/base
```

### Or clone the repo

```bash
git clone https://github.com/monorist/monorise.git
cd monorise
npm install
```

## 🛠️ Usage

### Basic Example

```js
import { yourFunction } from "your-package-name";

yourFunction("example");
```

### CLI Example (if applicable)

```bash
npx @monorise/cli
```

## 📄 Documentation

Link to full docs (in repo or external site):  
[👉 View the Docs](https://your-docs-url.com)

Or briefly explain the core API in the README itself if it’s small.

## 🤝 Contributing

We welcome contributions!  
Check out our [contributing guide](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md).

```bash
git checkout -b your-feature
git commit -m 'add amazing feature'
git push origin your-feature
```

## 📂 Folder Structure

```bash
.
├── src/            # Main source code
├── tests/          # Unit and integration tests
├── examples/       # Example usage
└── README.md
```

## ✅ Roadmap

- [x] Core DynamoDB Data Layer
- [x] React data access
- [x] CLI Generator
- [ ] Test cases
- [ ] Component for SST/Pulumi for simpler setup

## 🧪 Running Tests

```bash
# Start test environment
npm run start:test-env

# Test only available for core now
npm run test
```

## 🧰 Built With

- [Node.js](https://nodejs.org/)
- [Your Framework](https://example.com/)
- Other dependencies...

## 📝 License

Distributed under the MIT License.  
See [`LICENSE`](./LICENSE) for more information.

## 🌟 Acknowledgments

- Inspiration, references, or shout-outs
