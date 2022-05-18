import 'bootstrap/dist/css/bootstrap.min.css'
import {useState, useEffect} from 'react'
import Web3 from 'web3'
import abis from './utils/abis'

import PoolInfo from './components/PoolInfo'
import MarketsInfo from './components/MarketsInfo'
import SymbolsInfo from './components/SymbolsInfo'
import UserInfo from './components/UserInfo'
import OtherInfo from './components/OtherInfo'
import Decoder from './components/Decoder'

const ONE = new Web3.utils.BN('1000000000000000000')
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const MAX = '0XFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'

function nn(value, unit='ether') {
    return value ? Web3.utils.fromWei(value.toString(), unit) : undefined
}

function bb(value, unit='ether') {
    return value ? Web3.utils.toWei(value.toString(), unit) : undefined
}

function App() {

    const web3 = new Web3(window.ethereum)

    const pools = {
        futures: '0x265d9501724E8CFa18Ff935A1a37f18DBc05bCF6',
        option: '0x5b1a7AEB15EB5380EB35ceC8B40438EcB6D51018',
        inno: '0x669d43BbAf80a87040A8076BB6B9f4961774caE4',
    }

    const lens = new web3.eth.Contract(abis.DeriLens, '0x9245467fAcf60B3B85702Dbd4007d64408677f9C')
    const xvs = new web3.eth.Contract(abis.ERC20, '0xB9e0E753630434d7863528cc73CB7AC638a7c8ff')
    const tokenVault = new web3.eth.Contract(abis.TokenVault, '0x16728A3d98671c6b304510819D9C59A197CCcdC2')

    const [data, setData] = useState({
        account: ZERO_ADDRESS,
        poolId: 'futures',
        market: 'BUSD',
        symbol: 'BTCUSD',
        poolInfo: {},
        marketsInfo: {},
        symbolsInfo: {},
        userInfo: {},
        xvsBalance: undefined
    })

    useEffect(() => {(async () => {
        const account = await getAccount()
        const info = await getInfo('futures', account)
        const symbol = Object.keys(info.symbolsInfo)[0]
        const xvsBalance = nn(await xvs.methods.balanceOf(account).call())
        setData({...data, account, symbol, ...info, xvsBalance})
    })()}, [])

    const update = async (poolId, account) => {
        let symbol = poolId ? null : data.symbol
        poolId = poolId || data.poolId || 'futures'
        account = account || data.account || ZERO_ADDRESS
        if (poolId !== data.poolId) {
            setData({
                ...data,
                account: ZERO_ADDRESS,
                poolId: poolId,
                market: 'BUSD',
                symbol: 'BTCUSD',
                poolInfo: {},
                marketsInfo: {},
                symbolsInfo: {},
                userInfo: {},
            })
        }
        const info = await getInfo(poolId, account)
        symbol = symbol || Object.keys(info.symbolsInfo)[0]
        setData({...data, poolId, account, symbol, ...info})
    }

    const getContract = (abiname, address) => {
        return new web3.eth.Contract(abis[abiname], address)
    }

    const getAccount = async () => {
        return Web3.utils.toChecksumAddress((await window.ethereum.request({method: 'eth_requestAccounts'}))[0])
    }

    const getInfo = async (poolId, account) => {
        const info = await lens.methods.getInfo(pools[poolId], account, []).call()
        const tokenB0 = getContract('ERC20', info.poolInfo.tokenB0)

        const poolInfo = {}
        poolInfo.pool = info.poolInfo.pool
        poolInfo.reservedB0 = nn(await tokenB0.methods.balanceOf(info.poolInfo.pool).call())
        poolInfo.liquidity = nn(info.poolInfo.liquidity)
        poolInfo.lpsPnl = nn(info.poolInfo.lpsPnl)
        poolInfo.cumulativePnlPerLiquidity = nn(info.poolInfo.cumulativePnlPerLiquidity)
        poolInfo.protocolFeeAccrued = nn(info.poolInfo.protocolFeeAccrued)
        poolInfo.initialMarginRequired = nn(info.poolInfo.initialMarginRequired)

        const marketsInfo = {}
        for (let m of info.marketsInfo) {
            const mm = {}
            const bToken = getContract('ERC20', m.underlying)
            mm.bSymbol = m.underlyingSymbol === 'WBNB' ? 'BNB' : m.underlyingSymbol
            mm.vSymbol = m.vTokenSymbol
            mm.bAddress = m.underlying
            mm.vAddress = m.vToken
            mm.price = nn(m.underlyingPrice)
            mm.approved = nn(await bToken.methods.allowance(account, pools[poolId]).call()) > 0
            mm.balance = mm.bSymbol === 'BNB' ? nn(await web3.eth.getBalance(account)) : nn(await bToken.methods.balanceOf(account).call())
            marketsInfo[mm.bSymbol] = mm
        }
        for (let m of info.lpInfo.markets) {
            const bSymbol = m.underlyingSymbol === 'WBNB' ? 'BNB' : m.underlyingSymbol
            marketsInfo[bSymbol].balanceLp = nn(m.vTokenBalance) * nn(m.exchangeRate)
        }
        for (let m of info.tdInfo.markets) {
            const bSymbol = m.underlyingSymbol === 'WBNB' ? 'BNB' : m.underlyingSymbol
            marketsInfo[bSymbol].balanceTd = nn(m.vTokenBalance) * nn(m.exchangeRate)
        }

        const symbolsInfo = {}
        for (let s of info.symbolsInfo) {
            const ss = {}
            ss.symbol = s.symbol
            ss.alpha = nn(s.alpha)
            ss.fundingPeriod = `${parseInt(s.fundingPeriod / 86400)} days`
            ss.minTradeVolume = nn(s.minTradeVolume)
            ss.netVolume = nn(s.netVolume)
            ss.netCost = nn(s.netCost)
            ss.indexPrice = nn(s.indexPrice)
            ss.fundingTimestamp = s.fundingTimestamp
            ss.cumulativeFundingPerVolume = nn(s.cumulativeFundingPerVolume)
            ss.tradersPnl = nn(s.tradersPnl)
            ss.initialMarginRequired = nn(s.initialMarginRequired)
            ss.nPositionHolders = s.nPositionHolders
            ss.curIndexPrice = nn(s.curIndexPrice)
            ss.curVolatility = nn(s.curVolatility)
            ss.curCumulativeFundingPerVolume = nn(s.curCumulativeFundingPerVolume)
            ss.K = nn(s.K)
            ss.markPrice = nn(s.markPrice)
            ss.funding = nn(s.funding)
            ss.timeValue = nn(s.timeValue)
            ss.delta = nn(s.delta)
            ss.u = nn(s.u)
            ss.userVolume = null
            ss.userCost = null
            ss.userCumulativeFundingPerVolume = null
            symbolsInfo[ss.symbol] = ss
        }
        for (let p of info.tdInfo.positions) {
            symbolsInfo[p.symbol].userVolume = nn(p.volume)
            symbolsInfo[p.symbol].userCost = nn(p.cost)
            symbolsInfo[p.symbol].userCumulativeFundingPerVolume = nn(p.cumulativeFundingPerVolume)
        }

        const userInfo = {}
        userInfo.lTokenId = info.lpInfo.lTokenId
        userInfo.lpAmountB0 = nn(info.lpInfo.amountB0)
        userInfo.lpVaultLiquidity = nn(info.lpInfo.vaultLiquidity)
        userInfo.liquidity = nn(info.lpInfo.liquidity)
        userInfo.pTokenId = info.tdInfo.pTokenId
        userInfo.tdAmountB0 = nn(info.tdInfo.amountB0)
        userInfo.tdVaultLiquidity = nn(info.tdInfo.vaultLiquidity)
        userInfo.margin = parseFloat(userInfo.tdAmountB0) + parseFloat(userInfo.tdVaultLiquidity)

        return {
            poolInfo,
            marketsInfo,
            symbolsInfo,
            userInfo,
        }
    }

    const getOracleSignatures = async (poolId) => {
        const signatures = []
        if (poolId === 'option') {
            const urls = [
                'https://oracletestnet.deri.finance/get_signed_volatility_v3?symbol=VOL-BTCUSD',
                'https://oracletestnet.deri.finance/get_signed_volatility_v3?symbol=VOL-ETHUSD'
            ]
            await Promise.all(urls.map(async (url) => {
                const res = await fetch(url)
                const sig = await res.json()
                signatures.push([sig.data.symbolId, sig.data.timestamp, sig.data.volatility, sig.data.v, sig.data.r, sig.data.s])
            }))
        } else if (poolId === 'inno') {
            const urls = [
                'https://oracletestnet.deri.finance/get_signed_price_v3?symbol=AXSUSDT',
                'https://oracletestnet.deri.finance/get_signed_price_v3?symbol=ALICEUSDT',
                'https://oracletestnet.deri.finance/get_signed_price_v3?symbol=SHIBUSDT',
                'https://oracletestnet.deri.finance/get_signed_price_v3?symbol=BABYDOGEUSDT',
            ]
            await Promise.all(urls.map(async (url) => {
                const res = await fetch(url)
                const sig = await res.json()
                signatures.push([sig.data.symbolId, sig.data.timestamp, sig.data.price, sig.data.v, sig.data.r, sig.data.s])
            }))
        }
        return signatures
    }

    const onChangePoolId = async (poolId) => {
        await update(poolId)
    }

    const onChangeMarket = async (market) => {
        setData({...data, market})
    }

    const onChangeSymbol = async (symbol) => {
        setData({...data, symbol})
    }

    const onMint = async (bSymbol) => {
        const mintAmounts = {
            BUSD: 10000,
            SXP: 10000,
            ADA: 10000,
            CAKE: 2000,
            MATIC: 5000,
            AAVE: 100,
            TUSD: 10000,
            TRX: 5000,
            BTCB: '0.5',
            ETH: 5,
            LTC: 100,
            XRP: 20000,
        }
        await tokenVault.methods.withdraw(data.marketsInfo[bSymbol].bAddress, bb(mintAmounts[bSymbol])).send({from: data.account})
        await update()
    }

    const onApprove = async (bSymbol) => {
        await getContract('ERC20', data.marketsInfo[bSymbol].bAddress).methods.approve(pools[data.poolId], MAX).send({from: data.account})
        await update()
    }

    const onAddLiquidity = async (bSymbol, amount) => {
        const pool = getContract('PoolImplementation', pools[data.poolId])
        if (bSymbol === 'BNB') {
            await pool.methods.addLiquidity(
                ZERO_ADDRESS, 0, await getOracleSignatures(data.poolId)
            ).send({from: data.account, value: bb(amount)})
        } else {
            await pool.methods.addLiquidity(
                data.marketsInfo[bSymbol].bAddress, bb(amount), await getOracleSignatures(data.poolId)
            ).send({from: data.account})
        }
        await update()
    }

    const onRemoveLiquidity = async (bSymbol, amount) => {
        const pool = getContract('PoolImplementation', pools[data.poolId])
        if (bSymbol === 'BNB') {
            await pool.methods.removeLiquidity(
                ZERO_ADDRESS, bb(amount), await getOracleSignatures(data.poolId)
            ).send({from: data.account})
        } else {
            await pool.methods.removeLiquidity(
                data.marketsInfo[bSymbol].bAddress, bb(amount), await getOracleSignatures(data.poolId)
            ).send({from: data.account})
        }
        await update()
    }

    const onAddMargin = async (bSymbol, amount) => {
        const pool = getContract('PoolImplementation', pools[data.poolId])
        if (bSymbol === 'BNB') {
            await pool.methods.addMargin(
                ZERO_ADDRESS, 0, []
            ).send({from: data.account, value: bb(amount)})
        } else {
            await pool.methods.addMargin(
                data.marketsInfo[bSymbol].bAddress, bb(amount), []
            ).send({from: data.account})
        }
        await update()
    }

    const onRemoveMargin = async (bSymbol, amount) => {
        const pool = getContract('PoolImplementation', pools[data.poolId])
        if (bSymbol === 'BNB') {
            await pool.methods.removeMargin(
                ZERO_ADDRESS, bb(amount), await getOracleSignatures(data.poolId)
            ).send({from: data.account})
        } else {
            await pool.methods.removeMargin(
                data.marketsInfo[bSymbol].bAddress, bb(amount), await getOracleSignatures(data.poolId)
            ).send({from: data.account})
        }
        await update()
    }

    const onTrade = async (symbol, amount, priceLimit) => {
        const pool = getContract('PoolImplementation', pools[data.poolId])
        await pool.methods.trade(symbol, bb(amount), bb(priceLimit), await getOracleSignatures(data.poolId)).send({from: data.account})
        await update()
    }

    const onLiquidate = async (address) => {
        const pool = getContract('PoolImplementation', pools[data.poolId])
        const pToken = getContract('DToken', await pool.methods.pToken().call())
        const pTokenId = await pToken.methods.getTokenIdOf(address).call()
        if (pTokenId != 0) {
            await pool.methods.liquidate(pTokenId, await getOracleSignatures(data.poolId)).send({from: data.account})
        }
        await update()
    }

    const onClaimXVSLp = async () => {
        const pool = getContract('PoolImplementation', pools[data.poolId])
        await pool.methods.claimVenusLp(data.account).send({from: data.account})
        const xvsBalance = nn(await xvs.methods.balanceOf(data.account).call())
        setData({...data, xvsBalance})
    }

    const onClaimXVSTd = async () => {
        const pool = getContract('PoolImplementation', pools[data.poolId])
        await pool.methods.claimVenusTrader(data.account).send({from: data.account})
        const xvsBalance = nn(await xvs.methods.balanceOf(data.account).call())
        setData({...data, xvsBalance})
    }

    return (
        <div className="App">
            <h1>DeriV3 BSC Testnet (20220125)</h1>
            <br/>
            <PoolInfo poolId={data.poolId} poolIds={Object.keys(pools)} poolInfo={data.poolInfo} onChangePoolId={onChangePoolId} />
            <br/>
            <UserInfo userInfo={data.userInfo} />
            <br/>
            <MarketsInfo market={data.market} marketsInfo={data.marketsInfo} onChangeMarket={onChangeMarket} onMint={onMint} onApprove={onApprove} onAddLiquidity={onAddLiquidity} onRemoveLiquidity={onRemoveLiquidity} onAddMargin={onAddMargin} onRemoveMargin={onRemoveMargin} />
            <br/>
            <SymbolsInfo symbol={data.symbol} symbolsInfo={data.symbolsInfo} onChangeSymbol={onChangeSymbol} onTrade={onTrade} />
            <br/>
            <OtherInfo xvsBalance={data.xvsBalance} onLiquidate={onLiquidate} onClaimXVSLp={onClaimXVSLp} onClaimXVSTd={onClaimXVSTd} />
            <br/>
            <Decoder />
        </div>
    )

}

export default App
