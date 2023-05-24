const TokenA = artifacts.require("TokenA")
const TokenB = artifacts.require("TokenB")
const TokenC = artifacts.require("TokenC")
const WETH = artifacts.require("WETH")
const MyFactory = artifacts.require("MyFactory")
const MyRouter = artifacts.require("MyRouter")

module.exports = async function (deployer, network, accounts) {
    // Deploy AAA, BBB, CCC
    await deployer.deploy(TokenA, "AAA", "AAAA")
    await TokenA.deployed()

    await deployer.deploy(TokenB, "BBBB", "BBBB")
    await TokenB.deployed()

    await deployer.deploy(TokenC, "CCC", "CCC")
    await TokenC.deployed()

    // Deploy WETH.
    await deployer.deploy(WETH)
    const weth = await WETH.deployed()

    // Deploy the factory
    await deployer.deploy(MyFactory, accounts[0])
    const myFactory = await MyFactory.deployed()

    // Set the feeTo, feeTo2, feeTo3 addresses for the factory
    await myFactory.setFeeTo(accounts[1], accounts[2], accounts[3], {
        from: accounts[0]
    })

    // Deploying a Router
    await deployer.deploy(MyRouter, myFactory.address, weth.address)
    await MyRouter.deployed()
}