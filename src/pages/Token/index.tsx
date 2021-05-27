import React, { useContext, useEffect, useState } from 'react'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { Helmet } from 'react-helmet'
import { ThemeContext } from 'styled-components'
import { createChart } from 'lightweight-charts'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useLingui } from '@lingui/react'
import { ChevronRight, ExternalLink } from 'react-feather'
import { mockData } from './chartMockData'
import { Field } from '../../state/swap/actions'
import Lottie from 'lottie-react'
import swapArrowsAnimationData from '../../assets/animation/swap-arrows.json'
import { useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback'
import { useUserSlippageTolerance } from 'state/user/hooks'
import SushiImage from '../../assets/images/sushi.png'

export default function Token() {
    const { i18n } = useLingui()

    const theme = useContext(ThemeContext)
    const { account, chainId } = useActiveWeb3React()

    const chartRef = React.useRef() as any
    const [animateSwapArrows, setAnimateSwapArrows] = useState<boolean>(false)

    const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()

    // swap state
    const { independentField, typedValue, recipient } = useSwapState()
    const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()
    const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
        currencies[Field.INPUT],
        currencies[Field.OUTPUT],
        typedValue
    )

    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE

    const trade = showWrap ? undefined : v2Trade

    // get custom setting values for user
    const [allowedSlippage] = useUserSlippageTolerance()

    // check whether the user has approved the router on the input token
    const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

    // check if user has gone through approval process, used to show two step buttons, reset on token change
    const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

    // mark when a user has submitted an approval, reset onTokenSelection for input field
    useEffect(() => {
        if (approval === ApprovalState.PENDING) {
            setApprovalSubmitted(true)
        }
    }, [approval, approvalSubmitted])

    useEffect(() => {
        const chart = createChart(chartRef.current, {
            width: 672,
            height: 300,
            layout: {
                textColor: '#d1d4dc',
                backgroundColor: 'transparent'
            },
            rightPriceScale: {
                visible: false
            },
            leftPriceScale: {
                visible: false
            },
            timeScale: {
                visible: false
            },
            crosshair: {
                horzLine: {
                    visible: false
                },
                vertLine: {
                    visible: false
                }
            },
            grid: {
                vertLines: {
                    color: 'rgba(42, 46, 57, 0)'
                },
                horzLines: {
                    color: 'rgba(42, 46, 57, 0)'
                }
            }
        })
        const areaSeries = chart.addAreaSeries({
            topColor: 'rgba(38, 198, 218, 0.56)',
            bottomColor: 'rgba(38, 198, 218, 0.04)',
            lineColor: 'rgba(38, 198, 218, 1)',
            lineWidth: 2
        })
        const lineSeries = chart.addLineSeries({
            color: '#7d48b9',
            lineWidth: 2
        })
        lineSeries.setData(mockData)
    }, [])

    return (
        <>
            <Helmet>
                <title>Token | Sushi</title>
            </Helmet>

            <div className="flex items-center w-full max-w-2xl mb-5">
                <div className="font-bold text-purple mr-1">Tokens</div>
                <ChevronRight size="16" />
                <div className="text-high-emphesis ml-1">SUSHI</div>
            </div>

            <div className="flex justify-between w-full max-w-2xl rounded mb-4">
                <div className="flex items-center">
                    <img className="w-15 mr-3" src={SushiImage} alt="SUSHI" />
                    <span className="text-body font-bold md:text-h1 text-high-emphesis">SUSHI</span>
                    <span className="ml-2">(SUSHI)</span>
                </div>
                <div className="flex items-center">
                    <div className="text-body font-bold md:text-h1 text-high-emphesis">$17.01</div>
                    <div className="ml-4 text-green">+13.8%</div>
                </div>
            </div>

            <div ref={chartRef} className="w-full max-w-2xl rounded" />

            <div className="flex justify-end w-full max-w-2xl mb-6">
                <button className="p-3">24H</button>
                <button className="p-3">1W</button>
                <button className="p-3">1M</button>
                <button className="p-3">1Y</button>
                <button className="p-3 text-high-emphesis">ALL</button>
            </div>

            <div className="grid grid-cols-3 gap-6 w-full max-w-2xl mb-6">
                <div className="flex flex-col bg-dark-900 rounded p-6">
                    <div className="text-sm">Liquidity (24H)</div>
                    <div className="md:text-h5 text-high-emphesis">$222,275,124.89</div>
                    <div className="text-sm text-green">+2.34%</div>
                </div>
                <div className="flex flex-col bg-dark-900 rounded p-6">
                    <div className="text-sm">Volume (24H)</div>
                    <div className="md:text-h5 text-high-emphesis">$14,682,757.45</div>
                    <div className="text-sm text-red">-24.94%</div>
                </div>
                <div className="flex flex-col bg-dark-900 rounded p-6">
                    <div className="text-sm">Fees (24H)</div>
                    <div className="md:text-h5 text-high-emphesis">$44,048.27</div>
                    <div className="text-sm text-red">-24.94%</div>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-4 w-full max-w-2xl mb-8">
                <div className="col-span-2 bg-dark-900 rounded">1</div>
                <div className="col-span-2 bg-dark-900 rounded">
                    <button
                        className="bg-dark-900 rounded-full p-3px -mt-6 -mb-6 z-10"
                        onClick={() => {
                            setApprovalSubmitted(false) // reset 2 step UI for approvals
                            onSwitchTokens()
                        }}
                    >
                        <div
                            className="bg-dark-800 hover:bg-dark-700 rounded-full p-3"
                            onMouseEnter={() => setAnimateSwapArrows(true)}
                            onMouseLeave={() => setAnimateSwapArrows(false)}
                        >
                            <Lottie
                                animationData={swapArrowsAnimationData}
                                autoplay={animateSwapArrows}
                                loop={false}
                                style={{ width: 32, height: 32 }}
                                // className="text-secondary fill-current"
                            />
                        </div>
                    </button>
                </div>
                <button className="col-span-1 bg-dark-900 rounded flex items-center justify-center">Swap</button>
            </div>

            <div className="w-full max-w-2xl rounded py-4 mb-8">
                <div className="flex justify-between pb-6">
                    <div className="font-bold text-h4 text-high-emphesis">About SUSHI</div>
                    <button className="flex items-center">
                        <div className="mr-1">View Contract</div>
                        <ExternalLink size="16" />
                    </button>
                </div>
                <div className="text-high-emphesis">
                    SUSHI is the native liquidity incentive and governance token associated with the SushiSwap protocol,
                    an on-chain automated market maker protocol that is a community fork of the Uniswap protocol. Users
                    can earn SUSHI by contributing liquidity to pools though the SushiSwap staking interface. Holders of
                    SUSHI can participate in future governance over the protocol.
                </div>
            </div>

            <div className="w-full max-w-2xl mb-8">
                <div className="font-bold text-h4 text-high-emphesis pb-6">Top Moving Pairs</div>
                <div className="grid grid-cols-4 gap-6">
                    <div className="flex items-center bg-dark-900 p-4 rounded text-high-emphesis">
                        <img className="w-10 mr-2" src={SushiImage} alt="SUSHI" />
                        <div className="text-caption2 md:text-caption text-primary">SUSHI</div>
                    </div>
                    <div className="flex items-center bg-dark-900 p-4 rounded text-high-emphesis">
                        <img className="w-10 mr-2" src={SushiImage} alt="USDT" />
                        <div className="text-caption2 md:text-caption text-primary">USDT</div>
                    </div>
                    <div className="flex items-center bg-dark-900 p-4 rounded text-high-emphesis">
                        <img className="w-10 mr-2" src={SushiImage} alt="UNI" />
                        <div className="text-caption2 md:text-caption text-primary">UNI</div>
                    </div>
                    <div className="flex items-center bg-dark-900 p-4 rounded text-high-emphesis">
                        <img className="w-10 mr-2" src={SushiImage} alt="LINK" />
                        <div className="text-caption2 md:text-caption text-primary">LINK</div>
                    </div>
                    <div className="flex items-center bg-dark-900 p-4 rounded text-high-emphesis">
                        <img className="w-10 mr-2" src={SushiImage} alt="WBTC" />
                        <div className="text-caption2 md:text-caption text-primary">WBTC</div>
                    </div>
                    <div className="flex items-center bg-dark-900 p-4 rounded text-high-emphesis">
                        <img className="w-10 mr-2" src={SushiImage} alt="AAVE" />
                        <div className="text-caption2 md:text-caption text-primary">AAVE</div>
                    </div>
                    <div className="flex items-center bg-dark-900 p-4 rounded text-high-emphesis">
                        <img className="w-10 mr-2" src={SushiImage} alt="COMP" />
                        <div className="text-caption2 md:text-caption text-primary">COMP</div>
                    </div>
                    <div className="flex items-center bg-dark-900 p-4 rounded text-high-emphesis">
                        <img className="w-10 mr-2" src={SushiImage} alt="MKR" />
                        <div className="text-caption2 md:text-caption text-primary">MKR</div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-2xl mb-8">
                <div className="font-bold text-h4 text-high-emphesis pb-4">Top Farms</div>
                <div className="grid grid-cols-3 gap-6 px-4 py-2">
                    <div>Token Pair</div>
                    <div>ROI (1Y)</div>
                    <div>Rewards</div>
                </div>
                <div className="grid grid-cols-3 gap-6 bg-dark-900 rounded p-4">
                    <div>SUSHI-WETH</div>
                    <div>40.32%</div>
                    <div className="flex justify-between">
                        <div>ICON1</div>
                        <div>ICON2</div>
                    </div>
                </div>
            </div>
        </>
    )
}