import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import Web3 from 'web3'

import MyRouter from '@/contracts/MyRouter.json'
import MyFactory from '@/contracts/MyFactory.json'
import TokenA from '@/contracts/TokenA.json'
import TokenB from '@/contracts/TokenB.json'
import TokenC from '@/contracts/TokenC.json'
import MyPair from '@/contracts/MyPair.json'

const useAppStore = defineStore('app', () => {
    
    let timeout = null

    const tabsActive = ref('swap')

    const address = ref('')
    const isConnect = ref(false)

    const myFactoryAddress = MyFactory.networks[1337].address
    const myRouterAddress = MyRouter.networks[1337].address
    const tokenAAddress = TokenA.networks[1337].address
    const tokenBAddress = TokenB.networks[1337].address
    const tokenCAddress = TokenC.networks[1337].address

    const dapp = reactive({
        loading: null,
        web3: null,
        myRouter: null,
        myFactory: null,
        tokenA: null,
        tokenB: null,
        tokenC: null,
        pairAB: null,
        pairAC: null,
        pairBC: null,
        eventSwapAB: null,
        eventSwapAC: null,
        eventSwapBC: null,
        info: {
            tokenABalance: 0,
            tokenBBalance: 0,
            tokenCBalance: 0,
            lpABBalance: 0,
            lpACBalance: 0,
            lpBCBalance: 0,
            balance: 0,
        },
        swap: {
            selected: false,
            loading: false,
            enterQuantity: false,
            addLiquidity: false,
            input1: '',
            select1: '',
            input2: '',
            select2: '',
            types: 0,
            selectList: [
                { name: 'AAA', value: tokenAAddress },
                { name: 'BBB', value: tokenBAddress },
                { name: 'CCC', value: tokenCAddress },
            ]
        }
    })


    const dappInit = async () => {
        try {

            if (typeof window.ethereum == 'undefined') {
                throw { code: -1, message: "Please install metamask or open the page in the dapp environment" }
            }

            window.ethereum.on('accountsChanged', () => {
                window.location.reload();
            })

            window.ethereum.on('chainChanged', () => {
                window.location.reload()
            })


            window.ethereum._metamask.isUnlocked().then((res) => {
                if (!res) throw { code: -1, message: "Please unlock your wallet" }
            })

            if (window.ethereum.chainId !== 1337 && window.ethereum.networkVersion !== '1337') {
                throw { code: -1, message: "Switch to the Localhost:8575 network" }
            }
            
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
            address.value = accounts[0]
            isConnect.value = true

            dapp.web3 = new Web3(Web3.givenProvider)

            dapp.myRouter = new dapp.web3.eth.Contract(MyRouter.abi, MyRouter.networks[1337].address)
            dapp.myFactory = new dapp.web3.eth.Contract(MyFactory.abi, MyFactory.networks[1337].address)
            dapp.tokenA = new dapp.web3.eth.Contract(TokenA.abi, TokenA.networks[1337].address)
            dapp.tokenB = new dapp.web3.eth.Contract(TokenB.abi, TokenB.networks[1337].address)
            dapp.tokenC = new dapp.web3.eth.Contract(TokenC.abi, TokenC.networks[1337].address)

            await getBalance()
            await getEvents()

        } catch (error) {
            if (error.code == 4001) error.message = "The user refused to connect to the wallet"
            if (error.code == -32002) error.message = "Please open metamask login wallet"
            notice(`${error.message}`, false)
        }
    }

    const walletConnect = async () => {
        dappInit()
    }

    const tabsChange = async () => {
        getBalance()
    }

    const notice = (message, type) => {
        ElNotification({
            title: type ? 'Success' : 'Error',
            message,
            type: type ? 'success' : 'error',
        })
    }

    const openLoading = () => {
        dapp.loading = ElLoading.service({
            lock: true,
            text: 'Loading',
            background: 'rgba(0, 0, 0, 0.3)',
        })
    }

    const getEvents = async () => { }

    const cancelEvents = async () => { }

    const isZeroAddress = (address) => {
        return address == '0x0000000000000000000000000000000000000000'
    }

    const checkSelectAndInput = () => {
        if (dapp.swap.select1 != '' && dapp.swap.select2 != '') {
            dapp.swap.selected = true
        } else {
            dapp.swap.selected = false
        }

        if (dapp.swap.input1 != '' || dapp.swap.input2 != '') {
            dapp.swap.enterQuantity = true
        } else {
            dapp.swap.enterQuantity = false
        }
    }

    const select1Change = async (val) => {
        if (val == dapp.swap.select2) {
            dapp.swap.select2 = ''
            dapp.swap.input1 = dapp.swap.input2
            dapp.swap.input2 = ''
        }

        checkSelectAndInput()


        if (dapp.swap.select2 != '' && dapp.swap.input2 != '') {
            const pair = await checkPair(dapp.swap.select1, dapp.swap.select2)
            if (pair == false) return
            dapp.swap.input1 = await getAmountsIn(
                dapp.web3.utils.toWei(dapp.swap.input2.toString(), 'ether'),
                [dapp.swap.select1, dapp.swap.select2]
            )
            dapp.swap.loading = false
            dapp.swap.types = 1
            console.log('调用select1Change的第3个if')
            return
        }

        if (dapp.swap.select2 != '' && dapp.swap.input1 != '') {
            const pair = await checkPair(dapp.swap.select1, dapp.swap.select2)
            if (pair == false) return
            dapp.swap.input2 = await getAmountsOut(
                dapp.web3.utils.toWei(dapp.swap.input1.toString(), 'ether'),
                [dapp.swap.select1, dapp.swap.select2]
            )
            dapp.swap.loading = false
            dapp.swap.types = 0
            console.log('调用select1Change的第4个if')
            return
        }
    }

    const select2Change = async (val) => {

        if (val == dapp.swap.select1) {
            dapp.swap.select1 = ''
            dapp.swap.input2 = dapp.swap.input1
            dapp.swap.input1 = ''
        }

        checkSelectAndInput()

        if (dapp.swap.select1 != '' && dapp.swap.input1 != '') {
            const pair = await checkPair(dapp.swap.select1, dapp.swap.select2)
            if (pair == false) return
            dapp.swap.input2 = await getAmountsOut(
                dapp.web3.utils.toWei(dapp.swap.input1.toString(), 'ether'),
                [dapp.swap.select1, dapp.swap.select2]
            )
            dapp.swap.loading = false
            dapp.swap.types = 0
            console.log('调用select2Change的第3个if')
            return
        }

        if (dapp.swap.select1 != '' && dapp.swap.input2 != '') {
            const pair = await checkPair(dapp.swap.select1, dapp.swap.select2)
            if (pair == false) return
            dapp.swap.input1 = await getAmountsIn(
                dapp.web3.utils.toWei(dapp.swap.input2.toString(), 'ether'),
                [dapp.swap.select1, dapp.swap.select2]
            )
            dapp.swap.loading = false
            dapp.swap.types = 1
            console.log('调用select2Change的第4个if')
            return
        }
    }

    const input1Change = async (val) => {
        if (timeout !== null) clearTimeout(timeout)
        timeout = setTimeout(async () => {
            checkSelectAndInput()

            if (dapp.swap.input1 == '') {
                dapp.swap.input2 = ''
            }

            if (dapp.swap.select1 != '' && dapp.swap.select2 != '') {
                const pair = await checkPair(dapp.swap.select1, dapp.swap.select2)
                if (pair == false) return
                dapp.swap.input2 = await getAmountsOut(
                    dapp.web3.utils.toWei(dapp.swap.input1.toString(), 'ether'),
                    [dapp.swap.select1, dapp.swap.select2]
                )
                dapp.swap.loading = false
                dapp.swap.types = 0
                console.log('调用的input1事件', [dapp.swap.select1, dapp.swap.select2])
            }
        }, 1000)
    }

    const input2Change = async (val) => {
        if (timeout !== null) clearTimeout(timeout)
        timeout = setTimeout(async () => {
            checkSelectAndInput()

            if (dapp.swap.input2 == '') {
                dapp.swap.input1 = ''
            }

            if (dapp.swap.select1 != '' && dapp.swap.select2 != '') {
                const pair = await checkPair(dapp.swap.select1, dapp.swap.select2)
                if (pair == false) return
                dapp.swap.input1 = await getAmountsIn(
                    dapp.web3.utils.toWei(dapp.swap.input2.toString(), 'ether'),
                    [dapp.swap.select1, dapp.swap.select2]
                )
                dapp.swap.loading = false
                dapp.swap.types = 1
                console.log('调用的input2事件')
            }
        }, 1000)
    }

    const getAmountsIn = async (amountOut, path) => {
        try {
            console.log("getAmountsIn", amountOut, path)

            dapp.swap.loading = true
            const res = await dapp.myRouter.methods.getAmountsIn(amountOut, path).call()
            const result = parseFloat(dapp.web3.utils.fromWei(res[0], 'ether'))
            if (parseFloat(result) < 0.00001) {
                dapp.swap.addLiquidity = true
                return
            }
            return result
        } catch (error) {
            dapp.swap.loading = false
            return ''
        }
    }

    const getAmountsOut = async (amountIn, path) => {
        try {
            console.log("getAmountsOut", amountIn, path)

            dapp.swap.loading = true
            const res = await dapp.myRouter.methods.getAmountsOut(amountIn, path).call()
            const result = parseFloat(dapp.web3.utils.fromWei(res[1], 'ether'))
            if (parseFloat(result) < 0.00001) {
                dapp.swap.addLiquidity = true
                return
            }
            return result
        } catch (error) {
            dapp.swap.loading = false
            return ''
        }
    }


    const getBalance = async () => {
        try {
            const res = await ethereum.request({
                method: 'eth_getBalance',
                params: [address.value, 'latest'],
            })
            dapp.info.balance = parseFloat(dapp.web3.utils.fromWei(res, 'ether')).toFixed(2)
        } catch (error) { }

        try {
            const balanceA = await dapp.tokenA.methods.balanceOf(address.value).call()
            const balanceB = await dapp.tokenB.methods.balanceOf(address.value).call()
            const balanceC = await dapp.tokenC.methods.balanceOf(address.value).call()
            dapp.info.tokenABalance = parseFloat(dapp.web3.utils.fromWei(balanceA, 'ether')).toFixed(2)
            dapp.info.tokenBBalance = parseFloat(dapp.web3.utils.fromWei(balanceB, 'ether')).toFixed(2)
            dapp.info.tokenCBalance = parseFloat(dapp.web3.utils.fromWei(balanceC, 'ether')).toFixed(2)
        } catch (error) { }

        try {
            const res1 = await dapp.myFactory.methods.getPair(tokenAAddress, tokenBAddress).call()
            if (isZeroAddress(res1)) throw new Error('AAA/BBB pair does not exist')
            const pairAB = new dapp.web3.eth.Contract(MyPair.abi, res1)
            const lpABBalance = await pairAB.methods.balanceOf(address.value).call()
            dapp.info.lpABBalance = parseFloat(dapp.web3.utils.fromWei(lpABBalance, 'ether')).toFixed(2)
        } catch (error) { }

        try {
            const res2 = await dapp.myFactory.methods.getPair(tokenAAddress, tokenCAddress).call()
            if (isZeroAddress(res2)) throw new Error('AAA/CCC pair does not exist')
            const pairAC = new dapp.web3.eth.Contract(MyPair.abi, res2)
            const lpACBalance = await pairAC.methods.balanceOf(address.value).call()
            dapp.info.lpACBalance = parseFloat(dapp.web3.utils.fromWei(lpACBalance, 'ether')).toFixed(2)
        } catch (error) { }

        try {
            const res3 = await dapp.myFactory.methods.getPair(tokenBAddress, tokenCAddress).call()
            if (isZeroAddress(res3)) throw new Error('BBB/CCC pair does not exist')
            const pairBC = new dapp.web3.eth.Contract(MyPair.abi, res3)
            const lpBCBalance = await pairBC.methods.balanceOf(address.value).call()
            dapp.info.lpBCBalance = parseFloat(dapp.web3.utils.fromWei(lpBCBalance, 'ether')).toFixed(2)
        } catch (error) { }
    }

    const addLiquidity = async (type) => {
        try {
            openLoading()

            const amount = dapp.web3.utils.toWei("100000", "ether");
            const amount2 = dapp.web3.utils.toWei("200000", "ether");

            let token1
            let token2
            switch (type) {
                case 2:
                    token1 = tokenAAddress
                    token2 = tokenCAddress
                    break
                case 3:
                    token1 = tokenBAddress
                    token2 = tokenCAddress
                    break
                default:
                    token1 = tokenAAddress
                    token2 = tokenBAddress
                    break
            }

            await checkAllowance(token1, amount)
            await checkAllowance(token2, amount2)

            await dapp.myRouter.methods.addLiquidity(
                token1,
                token2,
                amount,
                amount2,
                0,
                0,
                address.value,
                Math.floor(Date.now() / 1000) + 60 * 10
            ).send({
                from: address.value,
            })

            dapp.loading.close()
            notice(`Broadcast data success`, true)
            await getBalance()

        } catch (error) {
            dapp.loading.close()
            notice(`Operation failure: ${error.message}`, false)
        }
    }

    const removeLiquidity = async (type) => {
        try {
            openLoading()

            let token1
            let token2
            switch (type) {
                case 2:
                    token1 = tokenAAddress
                    token2 = tokenCAddress
                    break
                case 3:
                    token1 = tokenBAddress
                    token2 = tokenCAddress
                    break
                default:
                    token1 = tokenAAddress
                    token2 = tokenBAddress
                    break
            }

            const pairAddress = await dapp.myFactory.methods.getPair(token1, token2).call()
            if (isZeroAddress(pairAddress)) throw new Error('Pair does not exist')
            const pairInstance = new dapp.web3.eth.Contract(MyPair.abi, pairAddress)
            const amount = await pairInstance.methods.balanceOf(address.value).call()
            if (amount == 0) throw new Error('There is no liquidity to remove')
            await pairInstance.methods.approve(myRouterAddress, amount).send({
                from: address.value
            })

            await dapp.myRouter.methods.removeLiquidity(
                token1,
                token2,
                amount,
                0,
                0,
                address.value,
                Math.floor(Date.now() / 1000) + 60 * 10
            ).send({
                from: address.value,
            })

            dapp.loading.close()
            notice(`Broadcast data success`, true)
            await getBalance()

        } catch (error) {
            dapp.loading.close()
            notice(`Operation failure: ${error.message}`, false)
        }
    }

    const checkPair = async (token1, token2) => {
        try {
            const pair =await dapp.myFactory.methods.getPair(token1, token2).call()
            if (isZeroAddress(pair)) {
                dapp.swap.addLiquidity = true
                return false
            }
            dapp.swap.addLiquidity = false
            return true
        } catch (error) {
            return false
        }
    }

    const checkAllowance = async (dst, amount) => {
        const allowanceA = parseFloat(dapp.web3.utils.fromWei(await dapp.tokenA.methods.allowance(address.value, myRouterAddress).call(), 'ether'))
        const allowanceB = parseFloat(dapp.web3.utils.fromWei(await dapp.tokenB.methods.allowance(address.value, myRouterAddress).call(), 'ether'))
        const allowanceC = parseFloat(dapp.web3.utils.fromWei(await dapp.tokenC.methods.allowance(address.value, myRouterAddress).call(), 'ether'))
        amount = dapp.web3.utils.fromWei(amount, 'ether')

        if (dst == tokenAAddress && allowanceA < amount) {
            await dapp.tokenA.methods.approve(myRouterAddress, dapp.web3.utils.toWei("100000000", 'ether')).send({
                from: address.value,
            })
        }
        if (dst == tokenBAddress && allowanceB < amount) {
            await dapp.tokenB.methods.approve(myRouterAddress, dapp.web3.utils.toWei("100000000", 'ether')).send({
                from: address.value,
            })
        }
        if (dst == tokenCAddress && allowanceC < amount) {
            await dapp.tokenC.methods.approve(myRouterAddress, dapp.web3.utils.toWei("100000000", 'ether')).send({
                from: address.value,
            })
        }
    }

    const swap = async () => {
        try {
            openLoading()

            if (dapp.swap.input1 == '' || dapp.swap.input2 == '') {
                throw new Error('Please enter the correct amount')
            }

            const amountIn = dapp.web3.utils.toWei(dapp.swap.input1.toString(), 'ether');
            const amountOut = dapp.web3.utils.toWei(dapp.swap.input2.toString(), 'ether');

            const path = [dapp.swap.select1, dapp.swap.select2];
            const to = address.value;
            const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

            await checkAllowance(path[0], amountIn)

            if (dapp.swap.types == 0) {
                await dapp.myRouter.methods.swapExactTokensForTokens(
                    amountIn,
                    0,
                    path,
                    to,
                    deadline
                ).send({ from: to });
            } else {
                await dapp.myRouter.methods.swapTokensForExactTokens(
                    amountOut,
                    dapp.web3.utils.toWei("100000000", 'ether'),
                    path,
                    to,
                    deadline
                ).send({ from: to });
            }

            dapp.loading.close()
            notice(`Broadcast data success`, true)
            await getBalance()

            dapp.swap.input1 = ''
            dapp.swap.input2 = ''
            dapp.swap.enterQuantity = true
            
        } catch (error) {
            dapp.loading.close()
            notice(`Operation failure: ${error.message}`, false)
        }
    }

    return {
        dapp,
        tabsActive,
        address,
        isConnect,
        myFactoryAddress,
        myRouterAddress,
        tokenAAddress,
        tokenBAddress,
        tokenCAddress,
        dappInit,
        tabsChange,
        walletConnect,
        cancelEvents,
        getBalance,
        select1Change,
        select2Change,
        input1Change,
        input2Change,
        addLiquidity,
        removeLiquidity,
        swap,
    }
}, {
    persist: {
        paths: ["tabsActive"]
    }
})

export default useAppStore