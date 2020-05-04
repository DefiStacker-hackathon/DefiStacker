# DefiStacker

> DeFi Flash Loan Builder

<!-- Badges -->

A no-code flash loan builder with drag and drop GUI. \*Define your flash loan path, and then opt to queue it to execute when some condition is met (perhaps by listening to specified on & off-chain parameters - similar to a cron schedule). e.g. Only run the saved flash loan path once ETH is below \$200USD and DAI lending is above 2%.

<!-- ![](header.png) -->

## Development setup

OS X & Linux:

1. Install dependencies

```sh
yarn && cd frontend/ && yarn
```

2. Start a local blockchain

```sh
ganache-cli
```

In a new terminal compile and migrate the contracts to this blockchain

```sh
truffle migrate
```

3. Start the front-end

```sh
cd frontend/ && yarn start
```

### Testing

```sh
truffle test
```

## Authors

<!-- Your Name – [@YourTwitter](https://twitter.com/dbader_org) – YourEmail@example.com -->

Connor

Justin Kaseman – [in/justin-kaseman](https://www.linkedin.com/in/justin-kaseman/) – justinkaseman@live.com

Sebastian

Sean

Valerie

Distributed under the MIT license. See `LICENSE` for more information.

## Contributing

1. Fork it (<https://github.com/DecentralizedPlanetarian/DefiStacker>)
2. Create your feature branch (`git checkout -b yourname/fooBar`)
3. Commit your changes using a semantic commit message(`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin yourname/fooBar`)
5. Create a new Pull Request
