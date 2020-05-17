## Getting Started

### Local Development

Make sure the project is running using:

1. Start docker, open a new terminal, and enter: `docker-compose up -d`
2. Run `truffle migrate`

Subgraph steps:

3. Ensure that your dependencies are installed; from the root directory run `cd subgraph/ && yarn`
4. Run the subgraph locally using `yarn local`
5. Once changes are made regenerate the code using `yarn codegen`
