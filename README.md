Operating Steps
---

### Install Metamask

Metamask Download Link：https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn

#### Install Node.js:
Use the latest LTS version，download link：https://nodejs.org/dist/v18.16.0/node-v18.16.0-x64.msi


#### Install Ganache
Download link：https://www.trufflesuite.com/ganache
Configure Ganache：NEW WORKSPACE，port: 8545，Chian ID: 1337

#### Configure Metamask
Import Ganache MNEMONIC，all localhost，port :8545，Chian ID 1337，switch localhost

#### Install dependencies 
```bash

npm install

npm install yarn truffle -g

# Go to the project root directory，then
yarn
```

#### Deployment contract
```bash
truffle migrate --reset
```

#### Starting front end
```bash
cd web
yarn
yarn dev
```

#### Run the test case
```bash
truffle test

# After you run the test, you may need to redeploy the contract
truffle migrate --reset
```

