const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
	contracts_build_directory: './web/src/contracts',
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: 1337,
            // 防止swap耗尽gas也没执行完逻辑
            gasLimit: 500000000,
        },
        bsctestnet: {
            provider: () => new HDWalletProvider(
                // 部署人助记词，需要有测试币
                `spot error visit urge weapon hire grunt glare glimpse crush mercy clip`,
                `https://data-seed-prebsc-1-s3.binance.org:8545`
            ),
            network_id: 97,
            gasLimit: 500000000,
            skipDryRun: true
        },
    },
    compilers: {
        solc: {
            version: "./node_modules/solc",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
    },
    plugins: [
        'truffle-plugin-verify'
    ],
    api_keys: {
        // 虽然是部署到BSC测试网，但这里要填主网的API KEY，注册后申请：https://bscscan.com/register
        bscscan: 'WRIA3TSVFBPXHTNHYH8D8KKX4HAFVHPDV8',
    },
    verify: {
        // 验证过程可以使用本地HTTP代理
        proxy: {
            host: '127.0.0.1',
            port: '1081',
        },
    },
};
