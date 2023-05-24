const TokenA = artifacts.require("TokenA")
const TokenB = artifacts.require("TokenB")
const TokenC = artifacts.require("TokenC")
const WETH = artifacts.require("WETH")
const MyFactory = artifacts.require("MyFactory")
const MyRouter = artifacts.require("MyRouter")
const MyPair = artifacts.require("MyPair")

contract("MyRouter", function (accounts) {
    let now;
    let tokenA;
    let tokenB;
    let tokenC;
    let weth;
    let myFactory;
    let myRouter;

    before(async function () {
        now = Math.floor(Date.now() / 1000)
        tokenA = await TokenA.deployed();
        tokenB = await TokenB.deployed();
        tokenC = await TokenC.deployed();
        weth = await WETH.deployed();
        myFactory = await MyFactory.deployed();
        myRouter = await MyRouter.deployed();

        // AAA, BBB, CCC, WETH authorize the router
        await tokenA.approve(myRouter.address, web3.utils.toWei("100000000", 'ether'));
        await tokenB.approve(myRouter.address, web3.utils.toWei("100000000", 'ether'));
        await tokenC.approve(myRouter.address, web3.utils.toWei("100000000", 'ether'));
    });

    it("Test add liquidity for AAA/BBB pair", async function () {
        const amount = web3.utils.toWei("10000", 'ether');

        const balanceABefore = web3.utils.fromWei(await tokenA.balanceOf(accounts[0]));
        const balanceBBefore = web3.utils.fromWei(await tokenB.balanceOf(accounts[0]));

        await myRouter.addLiquidity(
            tokenA.address,
            tokenB.address,
            amount,
            amount,
            0,
            0,
            accounts[0],
            now + 300
        );
        
        const balanceAAfter = web3.utils.fromWei(await tokenA.balanceOf(accounts[0]));
        const balanceBAfter = web3.utils.fromWei(await tokenB.balanceOf(accounts[0]));

        assert.isTrue(parseFloat(balanceABefore) > parseFloat(balanceAAfter), "AAA added liquidity successfully");
        assert.isTrue(parseFloat(balanceBBefore) > parseFloat(balanceBAfter), "BBB added liquidity successfully");
    });

    it("Test 1000 AAA swap to BBB", async function () {
        const amount = web3.utils.toWei("1000", 'ether');

        const balanceABefore = web3.utils.fromWei(await tokenA.balanceOf(accounts[0]));
        const balanceBBefore = web3.utils.fromWei(await tokenB.balanceOf(accounts[0]));

        await myRouter.swapExactTokensForTokens(
            amount,
            0,
            [tokenA.address, tokenB.address],
            accounts[0],
            now + 300
        );

        const balanceAAfter = web3.utils.fromWei(await tokenA.balanceOf(accounts[0]));
        const balanceBAfter = web3.utils.fromWei(await tokenB.balanceOf(accounts[0]));

        assert.isTrue(parseFloat(balanceABefore) > parseFloat(balanceAAfter), "Failed to swap AAA for BBB");
        assert.isTrue(parseFloat(balanceBBefore) < parseFloat(balanceBAfter), "Failed to swap AAA for BBB");
    });

    it("Test 1000 BBB swap to AAA", async function () {
        const amount = web3.utils.toWei("1000", 'ether');

        const balanceABefore = web3.utils.fromWei(await tokenA.balanceOf(accounts[0]));
        const balanceBBefore = web3.utils.fromWei(await tokenB.balanceOf(accounts[0]));

        await myRouter.swapExactTokensForTokens(
            amount,
            0,
            [tokenB.address, tokenA.address],
            accounts[0],
            now + 300
        );

        const balanceAAfter = web3.utils.fromWei(await tokenA.balanceOf(accounts[0]));
        const balanceBAfter = web3.utils.fromWei(await tokenB.balanceOf(accounts[0]));

        assert.isTrue(parseFloat(balanceABefore) < parseFloat(balanceAAfter), "Failed to swap BBB for AAA");
        assert.isTrue(parseFloat(balanceBBefore) > parseFloat(balanceBAfter), "Failed to swap BBB for AAA");
    });

    it("Test remove AAA/BBB pair", async function () {
        const amount = web3.utils.toWei("1000", 'ether');

        const balanceABefore = web3.utils.fromWei(await tokenA.balanceOf(accounts[0]));
        const balanceBBefore = web3.utils.fromWei(await tokenB.balanceOf(accounts[0]));

        // Query pool address
        const pairAddress = await myFactory.getPair(tokenA.address, tokenB.address);
        const pairInstance = await MyPair.at(pairAddress);

        // approve to router
        await pairInstance.approve(myRouter.address, amount);

        // remove
        await myRouter.removeLiquidity(
            tokenA.address,
            tokenB.address,
            amount,
            0,
            0,
            accounts[0],
            now + 300
        );

        const balanceAAfter = web3.utils.fromWei(await tokenA.balanceOf(accounts[0]));
        const balanceBAfter = web3.utils.fromWei(await tokenB.balanceOf(accounts[0]));

        // assert
        assert.isTrue(parseFloat(balanceABefore) < parseFloat(balanceAAfter), "Failed to swap BBB for AAA");
        assert.isTrue(parseFloat(balanceBBefore) < parseFloat(balanceBAfter), "Failed to swap BBB for AAA");
    });

    it("Test add liquidity for AAA/ETH pair", async function () {
        const amount = web3.utils.toWei("10000", 'ether');
        const value = web3.utils.toWei("2", 'ether');

        const balanceABefore = web3.utils.fromWei(await tokenA.balanceOf(accounts[0]));
        const balanceBefore = web3.utils.fromWei(await web3.eth.getBalance(accounts[0]));

        await myRouter.addLiquidityETH(
            tokenA.address,
            amount,
            0,
            0,
            accounts[0],
            now + 300,
            { value: value }
        );

        const balanceAAfter = web3.utils.fromWei(await tokenA.balanceOf(accounts[0]));
        const balanceAfter = web3.utils.fromWei(await web3.eth.getBalance(accounts[0]));

        assert.isTrue(parseFloat(balanceABefore) > parseFloat(balanceAAfter), "Failed to Added liquidity for AAA/ETH");
        assert.isTrue(parseFloat(balanceBefore) > parseFloat(balanceAfter), "Failed to Added liquidity for AAA/ETH");
    });

    it("Test 0.5 ETH swap to AAA", async function () {
        const amount = web3.utils.toWei("0.5", 'ether');

        const balanceABefore = web3.utils.fromWei(await tokenA.balanceOf(accounts[0]));
        const balanceBefore = web3.utils.fromWei(await web3.eth.getBalance(accounts[0]));

        await myRouter.swapExactETHForTokens(
            0,
            [weth.address, tokenA.address],
            accounts[0],
            now + 300,
            { value: amount }
        );

        const balanceAAfter = web3.utils.fromWei(await tokenA.balanceOf(accounts[0]));
        const balanceAfter = web3.utils.fromWei(await web3.eth.getBalance(accounts[0]));

        assert.isTrue(parseFloat(balanceABefore) < parseFloat(balanceAAfter), "Failed to swap ETH for AAA");
        assert.isTrue(parseFloat(balanceBefore) > parseFloat(balanceAfter), "Failed to swap ETH for AAA");
    });

    it("Test remove AAA/ETH pair", async function () {
        const amount = web3.utils.toWei("100", 'ether');

        const balanceABefore = web3.utils.fromWei(await tokenA.balanceOf(accounts[0]));
        const balanceBefore = web3.utils.fromWei(await web3.eth.getBalance(accounts[0]));

        // Query pool address
        const pairAddress = await myFactory.getPair(tokenA.address, weth.address);
        const pairInstance = await MyPair.at(pairAddress);

        // approve to router
        await pairInstance.approve(myRouter.address, amount);

        await myRouter.removeLiquidityETH(
            tokenA.address,
            amount,
            web3.utils.toWei("1", 'ether'),
            0,
            accounts[0],
            now + 300
        );

        const balanceAAfter = web3.utils.fromWei(await tokenA.balanceOf(accounts[0]));
        const balanceAfter = web3.utils.fromWei(await web3.eth.getBalance(accounts[0]));

        assert.isTrue(parseFloat(balanceABefore) < parseFloat(balanceAAfter), "Failed to swap AAA for ETH");
        assert.isTrue(parseFloat(balanceBefore) < parseFloat(balanceAfter), "Failed to swap AAA for ETH");
    });
});
