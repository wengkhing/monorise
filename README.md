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

Simplify Single table design with DynamoDB

## 🚀 Features

- Use DynamoDB as a Graph DB
- Access data through simple API calls
- Relationships management between entities
- No more writing complex DynamoDB queries

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
import { yourFunction } from 'your-package-name';

yourFunction('example');
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
