<template>
    <el-container class="p-5">
        <el-header>
            <h2 class="text-center">EXChain</h2>
        </el-header>
        <el-main class="flex justify-center">
            <el-card shadow="hover" style="width: 480px;">
                <el-tabs v-model="appStore.tabsActive" @tab-change="appStore.getBalance">
                    <el-tab-pane label="Swap" name="swap">
                        <el-form label-width="80px" class="pt-5">
                            <el-row class="justify-center">
                                <el-col :span="12">
                                    <el-form-item label="TokenA:">
                                        <el-text class="pl-2">{{ appStore.dapp.info.tokenABalance }}</el-text>
                                    </el-form-item>
                                    <el-form-item label="TokenC:">
                                        <el-text class="pl-2">{{ appStore.dapp.info.tokenCBalance }}</el-text>
                                    </el-form-item>
                                    <el-form-item label="LP-AC:">
                                        <el-text class="pl-2">{{ appStore.dapp.info.lpACBalance }}</el-text>
                                    </el-form-item>
                                </el-col>

                                <el-col :span="12">
                                    <el-form-item label="TokenB:">
                                        <el-text class="pl-2">{{ appStore.dapp.info.tokenBBalance }}</el-text>
                                    </el-form-item>
                                    <el-form-item label="LP-AB:">
                                        <el-text class="pl-2">{{ appStore.dapp.info.lpABBalance }}</el-text>
                                    </el-form-item>
                                    <el-form-item label="LP-BC:">
                                        <el-text class="pl-2">{{ appStore.dapp.info.lpBCBalance }}</el-text>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-divider border-style="dashed" />

                            <div class="area">
                                <el-row class="py-3">
                                    <el-col :span="17">
                                        <el-input
                                            v-model="appStore.dapp.swap.input1"
                                            size="large"
                                            input-style="line-height: 44px;font-size: 20px;"
                                            placeholder="0"
                                            type="number"
                                            :min="0"
                                            @input="appStore.input1Change"
                                        />
                                    </el-col>
                                    <el-col :span="7">
                                        <el-select v-model="appStore.dapp.swap.select1" size="large" @change="appStore.select1Change">
                                            <el-option
                                                v-for="item in appStore.dapp.swap.selectList"
                                                :key="item.value"
                                                :label="item.name"
                                                :value="item.value"
                                            />
                                        </el-select>
                                    </el-col>
                                </el-row>
                            </div>

                            <div class="area mt-2">
                                <el-row class="py-3">
                                    <el-col :span="17">
                                        <el-input
                                            v-model="appStore.dapp.swap.input2"
                                            size="large"
                                            input-style="line-height: 44px;font-size: 20px;"
                                            placeholder="0"
                                            type="number"
                                            :min="0"
                                            @input="appStore.input2Change"
                                        />
                                    </el-col>
                                    <el-col :span="7">
                                        <el-select v-model="appStore.dapp.swap.select2" size="large" @change="appStore.select2Change">
                                            <el-option
                                                v-for="item in appStore.dapp.swap.selectList"
                                                :key="item.value"
                                                :label="item.name"
                                                :value="item.value"
                                            />
                                        </el-select>
                                    </el-col>
                                </el-row>
                            </div>
                            <el-button
                                v-if="!appStore.isConnect"
                                type="danger"
                                class="mt-2"
                                plain
                                round
                                size="large"
                                style="width: 100%;height: 60px;font-size: 20px;font-weight: 600;"
                                @click="appStore.walletConnect"
                            >Connect wallet</el-button>
                            <el-button
                                v-else-if="!appStore.dapp.swap.selected"
                                class="mt-2"
                                plain
                                round
                                size="large"
                                style="width: 100%;height: 60px;font-size: 20px;font-weight: 600;"
                                disabled
                            >Select a token</el-button>
                            <el-button
                                v-else-if="!appStore.dapp.swap.enterQuantity"
                                class="mt-2"
                                plain
                                round
                                size="large"
                                style="width: 100%;height: 60px;font-size: 20px;font-weight: 600;"
                                disabled
                            >Enter a quantity</el-button>
                            <el-button
                                v-else-if="appStore.dapp.swap.addLiquidity"
                                class="mt-2"
                                plain
                                round
                                size="large"
                                style="width: 100%;height: 60px;font-size: 20px;font-weight: 600;"
                                disabled
                            >Please add liquidity</el-button>
                            <el-button
                                v-else="appStore.address.length && appStore.swap.selected"
                                type="success"
                                class="mt-2"
                                plain
                                round
                                size="large"
                                style="width: 100%;height: 60px;font-size: 20px;font-weight: 600;"
                                :loading="appStore.dapp.swap.loading"
                                @click="appStore.swap"
                            >Swap</el-button>
                        </el-form>
                    </el-tab-pane>

                    <el-tab-pane label="Pools" name="pools">
                        <div class="area">
                            <el-row class="justify-center pt-10">
                                <el-button
                                    size="large"
                                    type="primary"
                                    @click="appStore.addLiquidity(1)"
                                >Add 100000 AAA and 200000 BBB to liquidity</el-button>
                            </el-row>
                            <el-row class="justify-center pt-10">
                                <el-button
                                    size="large"
                                    type="success"
                                    @click="appStore.addLiquidity(2)"
                                >Add 100000 AAA and 200000 CCC to liquidity</el-button>
                            </el-row>
                            <el-row class="justify-center pt-10">
                                <el-button
                                    size="large"
                                    type="danger"
                                    @click="appStore.addLiquidity(3)"
                                >Add 100000 BBB and 200000 CCC to liquidity</el-button>
                            </el-row>
                            <el-divider border-style="dashed" />

                            <el-row class="justify-center">
                                <el-button
                                    size="large"
                                    type="primary"
                                    plain
                                    class="w-80"
                                    @click="appStore.removeLiquidity(1)"
                                >Remove all AAA/BBB liquidity</el-button>
                            </el-row>
                            <el-row class="justify-center pt-10">
                                <el-button
                                    size="large"
                                    type="success"
                                    plain
                                    class="w-80"
                                    @click="appStore.removeLiquidity(2)"
                                >Remove all AAA/CCC liquidity</el-button>
                            </el-row>
                            <el-row class="justify-center pt-10 pb-10">
                                <el-button
                                    size="large"
                                    type="danger"
                                    plain
                                    class="w-80"
                                    @click="appStore.removeLiquidity(3)"
                                >Remove all BBB/CCC liquidity</el-button>
                            </el-row>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="Contracts" name="contracts">
                        <div class="area">
                            <el-row class="justify-center">
                                <el-text tag="h1" size="25" class="pl-2 py-3">Contract Information</el-text>
                            </el-row>
                            <el-row class="justify-start">
                                <el-link type="primary" class="pl-2 py-2">Wallet: {{ appStore.address }}</el-link>
                            </el-row>
                            <el-row class="justify-start">
                                <el-link type="primary" class="pl-2 py-2">Factory: {{ appStore.myFactoryAddress }}</el-link>
                            </el-row>
                            <el-row class="justify-start">
                                <el-link type="primary" class="pl-2 py-2">Router: {{ appStore.myRouterAddress }}</el-link>
                            </el-row>
                            <el-row class="justify-start">
                                <el-link type="primary" class="pl-2 py-2">TokenA: {{ appStore.tokenAAddress }}</el-link>
                            </el-row>
                            <el-row class="justify-start">
                                <el-link type="primary" class="pl-2 py-2">TokenB: {{ appStore.tokenBAddress }}</el-link>
                            </el-row>
                            <el-row class="justify-start">
                                <el-link type="primary" class="pl-2 py-2">TokenC: {{ appStore.tokenCAddress }}</el-link>
                            </el-row>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-card>
        </el-main>
        <el-footer></el-footer>
    </el-container>
</template>
<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import useAppStore from '@/store/modules/app'

const appStore = useAppStore()

// 生命周期钩子
onMounted(async () => {
    // 延迟500毫秒，等待metamask加载完毕
    setTimeout(async () => {
        await appStore.dappInit()
    }, 500)
})
onBeforeUnmount(() => {
    // 取消事件监听
    appStore.cancelEvents()
})
</script>
<style>
    .area {
        position: relative;
        background-color: rgb(245, 246, 252);
        border-radius: 12px;
        padding: 10px;
        color: rgb(119, 128, 160);
        font-size: 14px;
        line-height: 20px;
        font-weight: 500;
    }
</style>