/* Mèche · contenu pédagogique en English (Académie, Quiz, glossaire, missions).
   Généré à partir des fragments de traduction ; le français (courses*.js, quizbank.js, glossary.js, missions.js) fait référence.
   Structure : T.c[id du module], T.q[id de l'unité], T.g[clé du glossaire], T.m[id de la mission]. Voir js/contentlang.js. */
window.M = window.M || {};
M.CONTENT_I18N = M.CONTENT_I18N || {};
(function () {
  const T = { c: {}, q: {}, g: {}, m: {} };
// ---- c01.js
T.c.bases = {
  title: "How the market works",
  sub: "Who buys, who sells, and why the price moves.",
  level: "Beginner",
  lessons: [
    ["A market = a never-ending auction", `<p>A market isn't a shop with a price tag. It's an <b>auction that never stops</b>: buyers announce what they're willing to pay, sellers what they're willing to accept. All of it sits in the [[carnet|order book]].</p>
<p>The best buying price is called the [[bid]], the best selling price the [[ask]]. The gap between them is the [[spread]] — a cost you pay on every trade without seeing it.</p>
<p>The price moves when one side is in more of a hurry than the other. Lots of buyers "taking" the ask? The price goes up. That's it. No magic, just supply and demand in real time.</p>`],
    ["The order types you need to know", `<ul>
<li><b>[[ordre-marche|Market order]]</b>: instant execution, price not guaranteed. Use it on very [[liquidite|liquid]] assets.</li>
<li><b>[[ordre-limite|Limit order]]</b>: you set your price. Ideal for entering calmly, without chasing the price.</li>
<li><b>[[stop-loss|Stop-loss]]</b>: your emergency exit if you're wrong. Non-negotiable.</li>
<li><b>[[take-profit|Take-profit]]</b>: automatically cashes in at your target.</li>
<li><b>[[trailing-stop|Trailing stop]]</b>: lets winners run while protecting what you've already gained.</li>
</ul>
<p>Careful: a stop-loss becomes a market order when it's hit. If the market [[gap|gaps]], it can be filled much further away (that's [[slippage]]).</p>`],
    ["Long, short, and PnL", `<p>Going [[long]] means betting on a rise. Going [[short]] means betting on a fall: you sell first and buy back later (lower, if all goes well).</p>
<p>Your [[pnl|PnL]] is "unrealised" while the position is open: it doesn't count until you close. Plenty of beginners watch a green unrealised PnL evaporate because they had no exit plan.</p>
<p>And the real value of your account at any moment is your [[equity]] = cash + open positions.</p>`],
    ["Candles: the language of the market", `<p>Each [[chandelier|candle]] sums up a period (the [[timeframe]]) with 4 prices: open, high, low, close. The body = from open to close. The [[meche|wicks]] = the extremes reached.</p>
<p>A long lower wick? Sellers pushed hard, but buyers bought it all back. A big green candle with lots of [[volume]]? Buyers have taken control.</p>
<p>👉 Go to <b>Live</b> and hover over the candles: you'll see their 4 prices appear.</p>`]
  ],
  key: ["Price = the constant meeting of buyers and sellers", "Spread and fees are invisible but real costs", "Always use a stop-loss, even in paper trading", "One candle = 4 prices: open, high, low, close"],
  quiz: [
    ["You buy at market. What price do you pay?", ["The bid", "The ask", "The average of the two"], "A market buy \"takes\" the cheapest seller's offer: the ask."],
    ["Your stop is at €100. The market opens straight at €92. You get out at…", ["€100, it's guaranteed", "Around €92", "You don't get out"], "A stop becomes a market order: after a gap, it's filled at the first available price."],
    ["A candle with a very long lower wick and a small body at the top usually means…", ["Sellers won the session", "Buyers rejected the drop", "Nothing, it's noise"], "The price fell a long way but was bought back: a rejection of the drop (to be confirmed by the next candle)."]
  ]
};

T.c.instruments = {
  title: "The instruments",
  sub: "Stocks, ETFs, forex, crypto, futures, options, CFDs… what you're really trading.",
  level: "Beginner",
  lessons: [
    ["Stocks & ETFs: owning a slice of the world", `<p>A [[action|share]] is a piece of a company. You profit if it gains value and through [[dividende|dividends]]. To judge whether it's expensive, look at the [[capitalisation|market cap]] and the [[per|P/E ratio]].</p>
<p>An [[etf|ETF]] tracks an entire [[indice|index]] (S&P 500, MSCI World, Nasdaq 100…): you buy 500 companies in one click, with tiny fees. It's the product that has exploded among young European investors since 2020 — for good reasons.</p>
<p>⚡ <b>Remember</b>: over the long run, most professional fund managers do worse than a simple index ETF.</p>`],
    ["Bonds: lending instead of owning", `<p>A [[obligation|bond]] is a loan. The government or company pays you a fixed coupon, then repays you at maturity.</p>
<p>The golden rule: <b>when [[taux-directeur|interest rates]] rise, the price of existing bonds falls</b> (nobody wants an old 1% coupon when new ones pay 4%). That's exactly what happened in 2022: the worst year in modern history for bonds.</p>`],
    ["Forex & commodities", `<p>[[forex|Forex]] is the biggest market in the world, open 24 hours a day on weekdays. You trade pairs: EUR/USD = how many dollars 1 euro is worth. Moves are small (measured in [[pip|pips]]), so leverage is often used.</p>
<p>[[matieres-premieres|Commodities]] (gold, oil, gas, wheat) react to geopolitics and the dollar. Gold remains the historic safe haven: it set record after record in 2024-2025, driven in particular by massive central bank buying.</p>
<p>In the app, you can trade gold via <b>PAXG</b> (a token backed by physical gold) and the euro via <b>EUR/USDT</b>.</p>`],
    ["Crypto: the market that never sleeps", `<p>[[crypto|Cryptos]] trade 24/7, with volatility 3 to 5 times higher than stocks. Bitcoin has its own coded "monetary policy": the [[halving]] cuts new supply roughly every 4 years.</p>
<p>Since January 2024, spot Bitcoin ETFs have been approved in the United States: Wall Street has entered crypto. In Europe, the [[mica|MiCA]] regulation now oversees platforms. [[stablecoin|Stablecoins]] (USDT, USDC) act as digital dollars.</p>
<p>⚠️ The dark side: [[pump-dump|pump & dumps]], [[rug|rug pulls]], memecoins created in 30 seconds. If a token has no use and no [[liquidite|liquidity]], you're not investing, you're gambling.</p>`],
    ["Derivatives: futures, perps, options, CFDs", `<p>A derivative is a <b>contract whose value depends on another asset</b>. You own nothing; you're betting on a price.</p>
<ul>
<li><b>[[futures|Futures]]</b>: buying/selling for a future date, with [[marge|margin]] and [[levier|leverage]].</li>
<li><b>[[perpetuel|Perpetuals]]</b>: crypto futures with no expiry, kept close to spot by the [[funding|funding rate]]. This is where cascades of [[liquidation|liquidations]] happen.</li>
<li><b>[[option|Options]]</b>: the right to buy ([[call]]) or to sell ([[put]]). The buyer's loss is limited to the premium. [[0dte|0DTE]] options (expiring the same day) now make up a huge share of S&P 500 options volume.</li>
<li><b>[[cfd|CFDs]]</b>: heavily sold to retail traders through aggressive ads. European brokers must display the % of clients who lose money: often 70 to 80%.</li>
</ul>`]
  ],
  key: ["Index ETF = the most solid base for investing", "Rates ↑ = bonds ↓", "Crypto = 24/7, very volatile, check the platform's regulation", "Derivatives = leverage = multiplied risk"],
  quiz: [
    ["The ECB raises rates by 1 point. Your existing fixed-coupon bond…", ["Gains value", "Loses value", "Doesn't move"], "New bonds pay more, so yours becomes less attractive: its price falls."],
    ["Which instrument gives you the RIGHT but not the obligation to buy?", ["A future", "A call", "A CFD"], "A call is a buy option: you pay a premium to have the choice."],
    ["Very positive funding rate on BTC perpetuals. That means…", ["Lots of traders are long, the market is overheated", "The market is panicking", "BTC is cheap"], "Longs pay shorts: the buy side is overcrowded, often a sign of euphoria."],
    ["Why are index ETFs so popular?", ["They guarantee a profit", "Diversification and very low fees", "They use leverage"], "One purchase = hundreds of companies, for fees often < 0.3% a year. No guaranteed profit, though."]
  ]
};

// ---- c02.js
T.c.styles = {
  title: "Ways to trade",
  sub: "Scalping, day trading, swing, position, DCA, algo: find your style.",
  level: "Beginner",
  lessons: [
    ["Time is your first decision", `<p>Before choosing a strategy, choose your <b>horizon</b>. It depends on your schedule, your temperament and your capital.</p>
<div class="styletable">
<div><b>⚡ [[scalping|Scalping]]</b><span>Seconds → minutes · 20-200 trades/day</span><em>Requires total attention and near-zero fees. 99% of retail traders lose against [[hft|HFT]] algos.</em></div>
<div><b>☀️ [[day-trading|Day trading]]</b><span>Minutes → hours · 1-10 trades/day</span><em>No overnight risk, but it's a full-time job. Very high failure rate in academic studies.</em></div>
<div><b>🌊 [[swing|Swing trading]]</b><span>Days → weeks · a few trades/month</span><em>The best compromise for students and employees: analyse in the evening, place your orders, live your life.</em></div>
<div><b>🏔️ [[position-trading|Position trading]]</b><span>Months → years</span><em>Based on macro and major trends. Few trades, lots of patience.</em></div>
<div><b>🐢 [[dca|DCA / investing]]</b><span>Years · automatic</span><em>The same amount every month into an ETF. Boring. And yet it's what makes the most people wealthy.</em></div>
<div><b>🤖 Algorithmic</b><span>Any duration</span><em>Coded rules, tested, executed without emotion. See the "4 algos" module.</em></div>
</div>`],
    ["Technical vs fundamental analysis", `<p><b>Technical</b>: you read the chart ([[tendance|trends]], [[support|supports]], indicators). Assumption: the price already reflects all information, and human behaviour repeats itself.</p>
<p><b>Fundamental</b>: you estimate the real value (earnings, [[per|P/E]], growth, [[taux-directeur|rates]]). Assumption: the price eventually catches up with value.</p>
<p><b>Quantitative</b>: you look for statistical patterns and test them ([[backtest|backtests]]).</p>
<p>Pros combine them: fundamentals say <i>what</i> to buy, technicals say <i>when</i>, risk management says <i>how much</i>.</p>`],
    ["The right style for you", `<ul>
<li>You're in class/at work all day → <b>swing</b> or <b>DCA</b>.</li>
<li>Watching a PnL stresses you out → long horizons, small sizes.</li>
<li>You like coding → <b>algo</b>, but start by backtesting in the Algo Lab.</li>
<li>You have less than €1,000 → fees and spread will eat scalping alive. Swing or investing.</li>
</ul>
<p>No style is "the best". The best one is the one you can apply <b>with discipline</b> for years.</p>`]
  ],
  key: ["Choose your time horizon first", "The shorter the timeframe, the more fees and noise weigh", "Swing and DCA fit best with a normal life"],
  quiz: [
    ["Student, 2 free hours in the evening, €500 of capital. The most suitable style?", ["Scalping", "Swing trading or DCA", "Day trading with ×20 leverage"], "Swing trading is analysed in the evening and fees weigh little; DCA is automatic."],
    ["Why is scalping so hard for a retail trader?", ["It's illegal", "Fees, spread and competition from HFT algos", "There isn't enough volatility"], "On gains of a few pips, fixed costs and the speed of pros make the difference."]
  ]
};

T.c.technique = {
  title: "Reading a chart",
  sub: "Trends, supports, resistances, breakouts and traps.",
  level: "Intermediate",
  lessons: [
    ["Trend comes first", `<p>An up[[tendance|trend]] = a series of highs and lows that keep getting <b>higher and higher</b>. As long as that structure holds, the trend is alive.</p>
<p>Rule no. 1: trade in the direction of the higher timeframe's trend. Want to buy on the 1h chart? Check that the 4h and the daily aren't in free fall.</p>`],
    ["Supports & resistances", `<p>A [[support]] is a zone where buyers have already stepped in. A [[resistance]] is where sellers have blocked the price. They are <b>zones</b>, not lines drawn to the cent.</p>
<p>The more often a zone has been tested, the more significant its break. And a broken resistance often becomes support (this is called a "flip").</p>
<p>Round numbers ($100,000 for BTC, $2,000 for ETH) often act as psychological magnets.</p>`],
    ["Breakouts… and fake breakouts", `<p>A [[breakout]] is an exit from a zone with strength and [[volume]]. But many breaks fail: that's the [[faux-breakout|fake breakout]], which traps buyers who were in too much of a hurry.</p>
<p>Useful filters: wait for the candle to <b>close</b> beyond the level, require above-average volume, or wait for the retest. And always a stop below the broken level.</p>`],
    ["Useful candle patterns", `<ul>
<li><b>Hammer</b>: small head, long lower [[meche|wick]], after a drop. Sellers rejected.</li>
<li><b>Bullish engulfing</b>: a green candle completely engulfs the previous red one.</li>
<li><b>Evening star</b>: big green, small indecisive, big red. Possible reversal.</li>
<li><b>Doji</b>: open ≈ close. Indecision.</li>
</ul>
<p>A pattern on its own is worth almost nothing. It matters when it appears <b>on a key level</b>, in a consistent context, and is confirmed by the next candle.</p>`]
  ],
  key: ["Structure of highs/lows = the trend", "Supports/resistances = zones, not lines", "A breakout is confirmed on the close and with volume", "No pattern without context"],
  quiz: [
    ["The price breaks a resistance, then closes back below it. That's…", ["A confirmed breakout", "A fake breakout", "A gap"], "The break didn't hold at the close: a classic fake breakout."],
    ["A resistance broken with strength often becomes…", ["A support", "A stronger resistance", "Useless"], "That's the \"flip\" principle: former sellers become buyers on the retest."]
  ]
};

T.c.indicateurs = {
  title: "The indicators that matter",
  sub: "SMA/EMA, RSI, MACD, Bollinger, ATR, VWAP: what they're really for.",
  level: "Intermediate",
  lessons: [
    ["Moving averages", `<p>The [[sma|SMA]] averages the last N closes. The [[ema|EMA]] reacts faster. The classics: 20 (short term), 50 (medium), 200 (the bull/bear border on the daily).</p>
<p>Uses: trend filter (price above the 200 MA = only look for buys) and signal (two averages crossing = the basis of the "Trend Following" algo).</p>`],
    ["RSI & MACD: momentum", `<p>The [[rsi|RSI]] oscillates between 0 and 100. Above 70 = overbought, below 30 = oversold. Beginner's mistake: shorting as soon as the RSI goes above 70. In a strong trend, it can stay there for weeks.</p>
<p>The [[macd|MACD]] measures acceleration. A cross above its signal line = bullish momentum picking up speed.</p>
<p>The most interesting signal of the two: [[divergence]]. A new high in price, but not in the RSI → the engine is running out of steam.</p>`],
    ["Volatility: Bollinger & ATR", `<p>[[bollinger|Bollinger Bands]] widen when volatility rises. When they tighten sharply (a "squeeze"), a big move is often brewing — without telling you which way.</p>
<p>The [[atr|ATR]] is the most underrated tool: it tells you how much the price "normally" moves. A stop at 1.5–2 ATR keeps you from being shaken out by simple noise.</p>`],
    ["VWAP & volume: the institutions' eye", `<p>The [[vwap|VWAP]] is the volume-weighted average price. Funds use it to judge their execution: buying below the VWAP = "bought well". Intraday, it often acts as a magnet or dynamic support.</p>
<p>[[volume|Volume]] validates everything else: a breakout without volume is suspicious.</p>
<p>⚠️ The more indicators you stack, the less you see the price. 2-3 complementary indicators (trend + momentum + volatility) are enough.</p>`]
  ],
  key: ["200 MA = long-term trend filter", "RSI > 70 doesn't mean \"sell\"", "ATR = the right distance for a stop", "2-3 indicators max, complementary"],
  quiz: [
    ["RSI at 78 in a strong uptrend. The most reasonable move?", ["Short immediately", "Don't short just because of that", "Buy with ×10 leverage"], "In a strong trend, the RSI can stay overbought for a long time: it's not a sell signal on its own."],
    ["What is the ATR mainly used for?", ["Predicting direction", "Measuring volatility to place stops", "Measuring volume"], "The ATR measures average range: ideal for sizing stops and positions."],
    ["The Bollinger Bands tighten sharply. That signals…", ["A certain rise", "A likely strong move, direction unknown", "A market dead forever"], "The squeeze announces an expansion in volatility, not its direction."]
  ]
};

// ---- c03.js
T.c.strategies = {
  title: "Trading strategies",
  sub: "Trend following, pullback, range, breakout, news: complete plans.",
  level: "Intermediate",
  lessons: [
    ["A strategy = 4 answers", `<p>If you can't answer the following 4 questions BEFORE entering, you don't have a strategy, you have a hunch:</p>
<ol><li><b>When do I enter?</b> (precise signal)</li><li><b>Where do I exit if I'm wrong?</b> ([[stop-loss]])</li><li><b>Where do I exit if I'm right?</b> ([[take-profit]] or [[trailing-stop|trailing stop]])</li><li><b>How much do I stake?</b> ([[sizing|position sizing]])</li></ol>`],
    ["1. Pullback in the trend", `<p><b>Idea</b>: in an uptrend, wait for a breather towards the 20 [[ema|EMA]] or a former level, then buy the resumption.</p>
<p><b>Entry</b>: resumption candle (hammer, engulfing) on the 20 EMA, price above the 50 EMA.<br><b>Stop</b>: below the last low.<br><b>Target</b>: former high, or an [[rr|R:R]] of at least 1:2.</p>
<p>It's the "cleanest" strategy to start with: you go with the current instead of swimming against it.</p>`],
    ["2. Range trading", `<p><b>Idea</b>: in a [[range]], buy the bottom, sell the top. It's [[mean-reversion|mean reversion]].</p>
<p><b>Entry</b>: rejection from support (lower wick, [[rsi|RSI]] < 35).<br><b>Stop</b>: just below the range.<br><b>Target</b>: middle or top of the range.</p>
<p>Danger: the day the range breaks, this strategy takes a loss. Hence the mandatory stop.</p>`],
    ["3. Breakout with confirmation", `<p><b>Idea</b>: enter when the price leaves a consolidation, because moves that follow a compression are often powerful.</p>
<p><b>Entry</b>: close above resistance + volume > average. Cautious option: wait for the retest.<br><b>Stop</b>: below the broken level.<br><b>Target</b>: height of the range projected, or a trailing stop.</p>
<p>Win rate often low (35-45%), but the winners are big. That's the spirit of the [[donchian|Donchian channel]].</p>`],
    ["4. News trading (handle with care)", `<p>[[cpi|CPI]] and [[nfp|NFP]] releases, [[fed|Fed]]/[[bce|ECB]] decisions and [[earnings]] create violent moves. The spread widens, [[slippage]] explodes.</p>
<p>The healthiest approach: <b>have no open position</b> just before the release, then trade the structure that forms afterwards. "Buy the rumor, sell the news": a highly anticipated event often triggers the opposite of what everyone expects (see the "Bitcoin ETF" mission).</p>`]
  ],
  key: ["Entry, stop, target, size: decided BEFORE entering", "Pullback = the simplest strategy to start with", "Range ≠ trend: don't use the same tools", "News: often better to watch than to take part"],
  quiz: [
    ["You're missing one answer before trading. Which is the most serious?", ["The profit target", "The stop-loss", "The strategy's name"], "Without a stop, a single mistake can wipe out months of gains."],
    ["A breakout strategy wins 38% of the time with an average R:R of 1:3. It is…", ["Losing", "Winning", "Impossible to tell"], "0.38 × 3 − 0.62 × 1 = +0.52 R per trade on average: winning (before fees)."]
  ]
};

T.c.algos = {
  title: "Algo trading: the 4 proven algos",
  sub: "Trend following, breakout, mean reversion, pairs trading — and how to test them.",
  level: "Advanced",
  lessons: [
    ["Why algos?", `<p>An algorithm applies rules <b>without emotion</b>, 24/7, and can be tested on years of data in a few seconds ([[backtest]]). Today, most of the volume on major stock markets is generated by algorithms.</p>
<p>But beware: there is <b>no algo that wins in every market</b>. Each strategy has its "regime": trend algos love directional markets and suffer in ranges, and the reverse is true for [[mean-reversion|mean reversion]]. The 4 below are among the most studied and used by professionals.</p>`],
    ["Algo 1 — Trend Following (EMA crossover + ATR stop)", `<p><b>Logic</b>: time-series [[momentum]] — what goes up tends to keep going. It's the basis of "CTA / managed futures" funds, which have applied it since the 1980s.</p>
<pre>IF EMA(fast) crosses ABOVE EMA(slow) → BUY
IF EMA(fast) crosses BELOW            → EXIT
Trailing stop = highest since entry − 3 × ATR</pre>
<p><b>Profile</b>: 30-40% winning trades, but huge gains when a trend takes hold. Suffers in choppy markets.</p>`],
    ["Algo 2 — Donchian Breakout (the Turtles' method)", `<p>In 1983, Richard Dennis taught beginners ("the Turtles") a simple system based on the [[donchian|Donchian channel]]. Several became millionaires. The rules have since been published.</p>
<pre>IF close > highest of the last 20 candles → BUY
IF close < lowest of the last 10 candles  → EXIT</pre>
<p><b>Profile</b>: few trades, long stretches of small losses, then one big win that pays for everything. Requires iron discipline.</p>`],
    ["Algo 3 — Mean Reversion (Bollinger + RSI)", `<p><b>Logic</b>: in the short term, excesses tend to correct. You buy the panic and sell the return to calm.</p>
<pre>IF close < lower Bollinger band AND RSI(14) < 30 → BUY
IF close > middle average (SMA 20)               → EXIT
Stop = entry − 2 × ATR</pre>
<p><b>Profile</b>: 60-70% winning trades, small regular gains… and sometimes a big loss when the market starts trending (catching a falling knife). The stop is vital.</p>`],
    ["Algo 4 — Pairs Trading (statistical arbitrage)", `<p><b>Logic</b>: two related assets (Coca-Cola/Pepsi, ETH/BTC) move together. When their spread becomes abnormal, you bet it will close. It's a "market neutral" strategy: you can win whether the market goes up or down.</p>
<pre>ratio = log(ETH) − log(BTC)
z = (ratio − mean(N)) / std dev(N)
IF z > +2 → sell ETH / buy BTC
IF z < −2 → buy ETH / sell BTC
IF |z| < 0.5 → close everything</pre>
<p>The [[z-score]] measures the anomaly. Main risk: the relationship breaks for good (the ratio starts trending).</p>`],
    ["Backtesting traps", `<ul>
<li><b>[[overfitting|Overfitting]]</b>: testing 500 settings and keeping the best = you've found the past, not the future. Test on one period, validate on another.</li>
<li><b>[[look-ahead|Look-ahead bias]]</b>: using a candle's close to enter… at the open of that same candle.</li>
<li><b>Forgotten fees & slippage</b>: a strategy with 300 trades/year and 0.1% fees pays 60% in round-trip fees. The Algo Lab includes them.</li>
<li><b>Survivorship bias</b>: testing on the cryptos that still exist today forgets all the ones that died.</li>
</ul>
<p>Measure quality with the [[sharpe|Sharpe ratio]], [[drawdown]] and [[profit-factor|profit factor]], not just return. And always compare with simple "buy and hold".</p>
<p>🧪 Head to the <b>Algo Lab</b>: test these 4 algos on real market data.</p>`],
    ["The pros' algos you won't see", `<p>For your general knowledge: [[market-maker|market makers]] and [[hft|HFT]] firms earn fractions of a cent millions of times a day, thanks to speed. Execution algos ([[twap|TWAP/VWAP]]) slice up funds' big orders. Quant funds use machine learning on alternative data (satellite images, bank transactions…).</p>
<p>And the "AI bots that guarantee 2% a day" sold on Telegram or TikTok? <b>100% scam</b>. If an algo really made that, nobody would sell it to you for €99.</p>`]
  ],
  key: ["No algo works in every market regime", "Trend & breakout: few winners, big gains", "Mean reversion: many winners, risk of a big loss", "Always count fees and slippage, and compare with buy & hold"],
  quiz: [
    ["Your mean reversion algo has 68% winning trades but loses money. How is that possible?", ["It's impossible", "The losses are much bigger than the gains", "The RSI is broken"], "Win rate isn't enough: a few big losses can wipe out many small gains."],
    ["You test 1,000 parameter combinations and keep the best. The risk?", ["Overfitting", "Slippage", "Funding"], "You've optimised on past noise: future performance will be much lower."],
    ["Which algo can win whether the market goes up or down?", ["Long-only trend following", "Pairs trading", "DCA"], "Pairs trading is \"market neutral\": it bets on the spread between two assets, not on direction."],
    ["A Telegram bot promises a guaranteed +2%/day for €99. You…", ["Buy it, it's a bargain", "Run: it's a scam", "Test it with €1,000"], "+2%/day = +137,000% a year. No real strategy does that, and nobody would sell it."]
  ]
};

T.c.risque = {
  title: "Risk management",
  sub: "The only real secret of traders who last.",
  level: "Essential",
  lessons: [
    ["The maths of ruin", `<p>Losing 10% takes +11% to get back. Losing 50% takes <b>+100%</b>. Losing 90% takes +900%. [[drawdown|Drawdown]] is asymmetric: protecting capital comes first.</p>
<p>That's why the [[regle-1pc|1% rule]] exists: risking 1% per trade, even 10 losses in a row only cost you about 10%.</p>`],
    ["Calculating your position size", `<p>Size isn't chosen "by feel". It's <b>calculated</b> from the stop:</p>
<pre>Size = (Capital × Risk %) ÷ Distance to stop

E.g.: $10,000 × 1% = $100 of risk
Buy BTC at $100,000, stop at $98,000 (−$2,000)
Size = 100 ÷ 2,000 = 0.05 BTC ($5,000 position)</pre>
<p>In the app's order ticket, the amount at risk down to the stop is shown in real time: use it.</p>`],
    ["Leverage is not your friend", `<p>[[levier|Leverage]] doesn't change your probability of being right. It only changes <b>how fast you lose when you're wrong</b>.</p>
<p>With ×10, a drop of about 10% = [[liquidation]]. Bitcoin regularly moves 10% in a few hours. During big crypto crashes, billions of dollars of leveraged positions are liquidated in a single day.</p>
<p>If you use leverage, work it out as a <b>consequence</b> of your sizing, never as a goal.</p>`],
    ["Expectancy & journal", `<p>Your strategy's expectancy = (win rate × average win) − (loss rate × average loss). If it's positive and you survive long enough, the maths works for you.</p>
<p>Keep a journal: why you entered, how you felt, whether you followed the plan. After 30 trades, you'll see your real flaws. The app's <b>Coach</b> does part of this work for you after each session.</p>`]
  ],
  key: ["Risk per trade: 1-2% max", "Size is calculated from the stop", "−50% takes +100%", "Leverage speeds up ruin, not success"],
  quiz: [
    ["Capital $5,000, risk 1%, distance to stop $50. How many units?", ["1", "10", "100"], "5,000 × 1% = $50 of risk ÷ $50 per unit = 1 unit."],
    ["Your account has lost 50%. To break even, you need…", ["+50%", "+75%", "+100%"], "From 50 to 100, you have to double: +100%."],
    ["With ×20 leverage, roughly what drop liquidates you?", ["~5%", "~20%", "~50%"], "1 ÷ 20 = a 5% move against you wipes out your margin."]
  ]
};

// ---- c04.js
T.c.psycho = {
  title: "Psychology & traps",
  sub: "FOMO, revenge trading, finfluencers: your brain is your worst enemy.",
  level: "Essential",
  lessons: [
    ["Your brain isn't built for trading", `<p>Loss aversion: a loss hurts about <b>twice as much</b> as an equivalent gain feels good. Result: we cut winners too early ("I'm locking it in") and hold losers too long ("it'll come back"). Exactly the opposite of what you should do.</p>`],
    ["FOMO, FUD and revenge trading", `<ul>
<li><b>[[fomo|FOMO]]</b>: you buy after +40% because your whole feed is talking about it. You're buying the liquidity of those who are selling.</li>
<li><b>[[fud|FUD]]</b>: you sell at the worst moment on a rumour.</li>
<li><b>[[revenge|Revenge trading]]</b>: you've just lost, so you go in bigger to win it back. The app's Coach detects it.</li>
</ul>
<p>The cure: a written plan before entering, a daily loss limit, and the right to do nothing.</p>`],
    ["Finfluencers & signals", `<p>On TikTok, Instagram or Telegram, many "traders" make a living… by selling courses, signals or affiliate links to brokers. Their money comes from you, not from the market.</p>
<p>In France, commercial influence on financial products has been regulated by a 2023 law: promotions must be clear and some risky products can't be promoted any old way. Red flags: "guaranteed" returns, screenshots of gains with no verifiable track record, urgency ("only 3 spots left"), a Lamborghini in the background.</p>`],
    ["Survivorship bias", `<p>You see the person who made ×100 on a memecoin. You don't see the thousands who lost everything on the 10,000 others. Success stories are visible because they're rare.</p>
<p>The real flex in trading isn't a big win. It's still being here in 5 years.</p>`]
  ],
  key: ["A loss hurts 2× more than a gain feels good", "Written plan + daily limit = anti-emotion", "Finfluencers often make money off you, not off the market", "Doing nothing is also a position"],
  quiz: [
    ["You've just lost $300. You feel the urge to double your size to win it back. That's…", ["Revenge trading", "Good management", "DCA"], "Increasing size on emotion after a loss: pure revenge trading."],
    ["The most obvious red flag in a \"trading coach\"?", ["He talks about risk management", "He promises guaranteed returns", "He shows his losses"], "No return is guaranteed in the markets. Promising otherwise is misleading."]
  ]
};

T.c.macro = {
  title: "Macro & market news",
  sub: "Rates, inflation, AI, tariffs, crypto ETFs: what moves the markets.",
  level: "Intermediate",
  lessons: [
    ["Rates: the gravity of markets", `<p>When the [[fed|Fed]] or the [[bce|ECB]] raises its [[taux-directeur|policy rate]], money becomes expensive: risky assets (tech, crypto) suffer and new bonds become attractive. When they cut, the opposite happens.</p>
<p>2022: the fastest rate hikes since the 1980s to fight post-Covid [[inflation]] → tech stocks and crypto in a [[bear|bear market]]. From 2024, the major central banks began cutting rates. Every meeting remains a major market event.</p>
<p>The numbers to watch: [[cpi|CPI]] (inflation), [[nfp|NFP]] (jobs), and central bankers' press conferences.</p>`],
    ["The AI era on the stock market", `<p>Since ChatGPT (late 2022), artificial intelligence has been THE theme of stock markets. Chipmakers and cloud giants have seen their [[capitalisation|market caps]] explode, and a handful of mega-caps now make up a record share of the S&P 500.</p>
<p>What it means for you: buying "the market" through an S&P 500 [[etf|ETF]] also means being heavily concentrated in a few tech stocks. And every [[earnings]] release from these giants moves the whole index.</p>`],
    ["Geopolitics & tariffs", `<p>In early April 2025, the announcement of massive US tariffs triggered one of the most brutal market drops since 2020. A few days later, the announcement of a pause sparked a historic rebound.</p>
<p>Lesson: markets hate uncertainty, react within minutes, and often overreact in both directions. Having a stop and a reasonable size is what lets you survive those days (replay it in <b>Missions</b>).</p>
<p>Another example: on 5 August 2024, the unwinding of the yen [[carry-trade|carry trade]] sent Japan's Nikkei down more than 12% in one session, dragging crypto and global stocks with it.</p>`],
    ["Crypto: from underground to Wall Street", `<p>Recent milestones:</p>
<ul>
<li><b>January 2024</b>: first spot Bitcoin ETFs in the United States. Billions pour in… but BTC drops ~20% over the next two weeks ("sell the news").</li>
<li><b>April 2024</b>: fourth [[halving]].</li>
<li><b>Late 2024</b>: BTC breaks $100,000 for the first time.</li>
<li><b>Europe</b>: [[mica|MiCA]] applies in full; platforms must be licensed.</li>
<li><b>2025</b>: the United States adopts a legal framework for [[stablecoin|stablecoins]]; the [[rwa|tokenisation]] of real-world assets (Treasury bills, funds) accelerates.</li>
</ul>
<p>The crypto market has become more institutional — and therefore more sensitive to macro (rates, the dollar) than before.</p>`],
    ["New trends among young traders", `<ul>
<li><b>[[0dte|0DTE options]]</b>: huge success, huge risk.</li>
<li><b>[[prop-firm|Prop firms]]</b>: "we'll fund you $100,000". Read the terms: most challenges are failed, and it's the entry fees that fund the model.</li>
<li><b>Prediction markets</b>: betting on events (elections, rates). Regulation varies widely from country to country.</li>
<li><b>Copy trading</b>: copying a trader. Check their max drawdown, not just their return.</li>
<li><b>Scheduled investing</b>: automatic DCA into ETFs from a few euros a month. Less sexy, but often the best financial decision of your twenties.</li>
</ul>`]
  ],
  key: ["Policy rates drive the valuation of every asset", "AI concentrates the stock market on a few giants", "Geopolitical shocks = extreme volatility in both directions", "Crypto is now correlated with macro"],
  quiz: [
    ["The Fed announces a surprise rate hike. Typical reaction of tech stocks?", ["Up", "Down", "None"], "Higher rates = future cash flows worth less and pricier money: high-growth tech falls."],
    ["After spot Bitcoin ETFs were approved in January 2024, BTC…", ["Doubled immediately", "First dropped (\"sell the news\")", "Didn't move"], "The event was expected and priced in: many sold the news."],
    ["An S&P 500 ETF in 2026 is…", ["Perfectly equal-weighted", "Heavily concentrated in a few tech giants", "Only banks"], "The index is weighted by market cap: tech mega-caps weigh very heavily in it."]
  ]
};

T.c.reel = {
  title: "Going live without getting scammed",
  sub: "Choosing a broker, avoiding scams, understanding tax.",
  level: "Essential",
  lessons: [
    ["Checklist before depositing €1", `<ol>
<li>Is the platform regulated? In France: check the [[amf|AMF]] and ACPR registers (REGAFI), and the AMF blacklists. Elsewhere: your country's financial regulator.</li>
<li>For crypto: a [[mica|MiCA]] licence (CASP) in an EU country.</li>
<li>Does it ask for [[kyc|KYC]]? If not → run.</li>
<li>Can you withdraw easily? Test with a small amount.</li>
<li>Fees: commission, [[spread]], currency conversion, custody fees, withdrawal fees.</li>
</ol>`],
    ["The most common scams", `<ul>
<li><b>The fake adviser</b> who contacts you on WhatsApp/Instagram after a "like". He lets you win a little at first… then blocks withdrawals.</li>
<li><b>The crypto romance</b> ("pig butchering"): an online relationship, then an "opportunity" on a fake platform.</li>
<li><b>The [[pump-dump|pump & dump]]</b> in Telegram groups.</li>
<li><b>The fake AI bot</b> with guaranteed returns.</li>
<li><b>The [[rug|rug pull]]</b> on a new token.</li>
</ul>
<p>Golden rule: <b>nobody serious contacts you first to make you money.</b></p>`],
    ["Tax (France): the basics", `<p>In France, capital gains on securities held in an ordinary brokerage account are in principle subject to the single flat-rate levy ("flat tax"). The [[pea|PEA]] offers very favourable tax treatment after 5 years. Crypto gains have their own regime, and accounts opened abroad must be declared. Rules differ in every country: check your own.</p>
<p>⚠️ Rates and rules change regularly with finance laws: always check with your tax authority (impots.gouv.fr in France) or a professional before filing.</p>`],
    ["Your roadmap", `<ol>
<li>Paper trading here until you have a written plan and 50+ journaled trades.</li>
<li>A Coach score consistently above 70.</li>
<li>Go live with an amount you can lose 100% of without it changing your life.</li>
<li>Same rules, same risk size. Real money adds emotions: it's normal to do worse at first.</li>
</ol>
<p>And alongside it: an emergency fund, then regular long-term investing. Active trading is the cherry, not the cake.</p>`]
  ],
  key: ["Check regulation (AMF/ACPR/MiCA or your local regulator) before any deposit", "Nobody serious cold-calls you to make you money", "Start small with real money, same rules as paper", "Find out about the tax rules that apply to you"],
  quiz: [
    ["Someone contacts you on Instagram about a platform that \"returns 30%/month\". You…", ["Test it with €100", "Check the regulator's blacklist and don't reply", "Share it with your friends"], "Cold contact + unrealistic return = almost certainly a scam."],
    ["The first criterion for choosing a broker?", ["The coolest ad", "Regulation", "The maximum leverage"], "Without regulation, your money isn't protected."]
  ]
};

// ---- c05.js
T.c.afrique = {
  title: "Investing from West Africa: BRVM & WAEMU",
  sub: "The Abidjan stock exchange, SGIs, the CFA franc, government bonds — and local scams.",
  level: "Essential",
  lessons: [
    ["The BRVM, your regional exchange", `<p>The [[brvm|BRVM]] is the stock exchange shared by the 8 countries of the [[uemoa|WAEMU]] — Benin, Burkina Faso, Côte d'Ivoire, Guinea-Bissau, <b>Mali</b>, Niger, Senegal, Togo. It is based in Abidjan and lists shares and bonds in [[fcfa|CFA francs]].</p>
<p>You'll find companies you know: telecom operators, banks, retailers, agribusiness… The benchmark indices are the <b>BRVM Composite</b> (all shares), the <b>BRVM 30</b> (the most traded) and the <b>BRVM Prestige</b>.</p>
<p>Special features: the market is much less [[liquidite|liquid]] than Paris or New York (some shares rarely trade), but listed companies often pay high [[dividende|dividends]].</p>`],
    ["How to buy a BRVM share from Mali", `<ol>
<li>Open a securities account with an [[sgi|SGI]] licensed by the [[amf-umoa|AMF-UMOA]] (check the official list on the authority's website).</li>
<li>Provide your ID documents ([[kyc|KYC]]) and fund the account (bank transfer, sometimes mobile money depending on the SGI).</li>
<li>Place an order (often a [[ordre-limite|limit order]] given the low liquidity).</li>
<li>The securities are held by the regional central depository; you receive dividends into your account.</li>
</ol>
<p>Compare each SGI's fees: brokerage commission, custody fees, account fees. On small amounts, they weigh heavily.</p>`],
    ["Government bonds and regional loans", `<p>WAEMU states borrow regularly on the regional market: public bond offerings (open to individuals through SGIs and banks) and government securities sold at auction (mainly for banks).</p>
<p>These [[obligation|bonds]] pay a fixed coupon in CFA francs. The main risk isn't currency (no foreign currency involved), but the <b>issuer's risk</b> and the difficulty of selling before maturity.</p>
<p>The [[bceao|BCEAO]] sets the zone's policy rates: when it raises them, new bonds pay more.</p>`],
    ["The CFA franc and currency risk", `<p>The CFA franc is pegged to the euro (€1 = 655.957 CFA francs). Consequence: against the euro, your savings don't move; against the <b>dollar</b>, they follow EUR/USD.</p>
<p>If you buy Bitcoin or US shares in dollars, you take two risks: that of the asset AND that of the dollar against the CFA franc. In the app, you can display your portfolio in CFA francs (Settings → Language & currency).</p>`],
    ["Scams targeting young people in West Africa", `<ul>
<li><b>WhatsApp/Telegram "traders"</b> who promise to double your mobile money deposit in a week.</li>
<li><b>Ponzi platforms</b>: you win at first thanks to newcomers' deposits, then the site disappears with everything.</li>
<li><b>"Referral" schemes</b>: you're paid mainly to recruit other people = a pyramid scheme.</li>
<li><b>Fake celebrity or "coach" accounts</b> asking for a Wave / Orange Money transfer.</li>
</ul>
<p>Simple rule: if someone asks you to send mobile money to an individual to "invest", it's a scam. A real SGI or bank has offices, a verifiable licence and written contracts.</p>`]
  ],
  key: ["The BRVM is the shared stock exchange of the 8 WAEMU countries, including Mali", "You access it through an SGI licensed by the AMF-UMOA", "Low liquidity: limit orders and patience", "Mobile money sent to an individual to \"invest\" = scam"],
  quiz: [
    ["Where is the BRVM based?", ["Bamako", "Dakar", "Abidjan"], "The BRVM is headquartered in Abidjan, Côte d'Ivoire, and serves the 8 WAEMU countries."],
    ["To buy a share listed on the BRVM, you go through…", ["A licensed SGI", "A mobile money agent", "The BCEAO directly"], "The SGI is the licensed intermediary that transmits your orders and keeps your securities account."],
    ["How many CFA francs is €1 worth?", ["600", "655.957", "It changes every day"], "The parity is fixed: €1 = 655.957 CFA francs."]
  ]
};

T.c.fondamentale = {
  title: "Fundamental analysis: reading a company",
  sub: "Revenue, margins, debt, cash, P/E: knowing whether a share is worth its price.",
  level: "Intermediate",
  lessons: [
    ["The 3 documents that tell you everything", `<ul>
<li><b>The income statement</b>: revenue → margins → net profit. Is the company making money?</li>
<li><b>The balance sheet</b>: what it owns (assets) and what it owes (debts). Is it solid?</li>
<li><b>The [[flux-tresorerie|cash flow]] statement</b>: the money actually collected. Profit can be dressed up; cash much less so.</li>
</ul>
<p>These documents are published every year (and often every quarter: [[earnings]]).</p>`],
    ["The essential ratios", `<ul>
<li><b>Revenue growth</b>: is the company selling more every year?</li>
<li><b>Net margin</b> = profit ÷ revenue. 20% = it keeps 20 cents of every euro sold.</li>
<li><b>Net debt / operating profit</b>: beyond 3-4 years of profit, debt becomes heavy.</li>
<li><b>[[per|P/E]]</b>: price ÷ earnings per share. A P/E of 15 = you're paying for 15 years of current earnings.</li>
<li><b>Dividend yield</b> = dividend ÷ share price.</li>
</ul>
<p>A ratio on its own means nothing: compare it with competitors and with the company's history.</p>`],
    ["Expensive or cheap?", `<p>A share with a P/E of 40 isn't necessarily expensive if earnings double every two years. A share with a P/E of 6 isn't necessarily a bargain if the company is in decline (a "value trap").</p>
<p>The real question: <b>does the current price already reflect future growth?</b> Professional investors estimate future cash flows and discount them back to today (the DCF method). The higher [[taux-directeur|rates]] are, the less distant cash flows are worth — which is why tech suffers when rates rise.</p>`],
    ["Competitive advantage (the \"moat\")", `<p>The best companies have a moat that protects their profits: a strong brand, a network everyone uses (network effect), lower costs than every competitor, or customers who can't easily leave.</p>
<p>A dominant telecom operator in its country, for example, benefits from infrastructure that's very expensive to copy. Always ask yourself: <b>why couldn't a competitor do the same thing tomorrow?</b></p>`]
  ],
  key: ["Income statement, balance sheet, cash flow", "Cash is more reliable than profit", "A P/E is compared, never judged alone", "Look for a lasting competitive advantage"],
  quiz: [
    ["Which document shows the money actually collected?", ["The balance sheet", "The cash flow statement", "The AGM report"], "Cash flows trace the real inflows and outflows of cash."],
    ["A share with a very low P/E is always a good deal.", ["True", "False"], "A low P/E can reflect a company in decline: that's the \"value trap\"."]
  ]
};

T.c.options = {
  title: "Options without the headache",
  sub: "Call, put, premium, strike, expiry, Greeks: understand before you touch.",
  level: "Advanced",
  lessons: [
    ["An option = a ticket with a deadline", `<p>A [[call]] gives you the right to buy an asset at a fixed price (the [[strike]]) until a date (expiry). A [[put]] gives you the right to sell. For that right, you pay a [[prime|premium]].</p>
<p>Example: share at €100. You buy a 105-strike call expiring in 1 month for €2. If the share ends at €115, your call is worth €10 (115 − 105): +400%. If it ends below €105, it's worth 0: you lose your €2.</p>`],
    ["Why most options bought end up at zero", `<p>The premium contains [[valeur-temps|time value]]: you're paying for the hope of a move. Every day, that value melts away (that's [[theta]]), and it speeds up as expiry approaches.</p>
<p>To win by buying an option, you have to be right about <b>direction</b>, <b>size</b> AND <b>timing</b>. Three conditions at once. That's why option sellers (often pros) collect a small premium most of the time… and occasionally take a huge loss.</p>`],
    ["The Greeks in one sentence", `<ul>
<li><b>[[delta|Delta]]</b>: sensitivity to the asset's price.</li>
<li><b>[[theta|Theta]]</b>: value lost for each day that passes.</li>
<li><b>Vega</b>: sensitivity to expected [[volatilite|volatility]]. After an announcement, volatility drops and options lose value even if the share moves ("volatility crush").</li>
<li><b>Gamma</b>: how fast delta changes.</li>
</ul>`],
    ["3 sensible uses", `<ul>
<li><b>The protective put</b>: you own a share and buy a put to limit your loss, like insurance.</li>
<li><b>The covered call</b>: you own the share and sell a call above the price to collect a premium (you cap your gain).</li>
<li><b>The call instead of the share</b>: exposure to the upside with a loss limited to the premium.</li>
</ul>
<p>⚠️ [[0dte|0DTE options]] (expiring the same day) have gone viral: it's ultra-short-term betting. Tiny size or none at all.</p>`]
  ],
  key: ["Call = right to buy, put = right to sell", "The premium is the buyer's maximum loss", "Time works against the buyer (theta)", "Healthy use: protection, not a lottery"],
  quiz: [
    ["You buy a 50-strike call for a premium of 3. At expiry the share is worth 58. Your net gain per option?", ["8", "5", "3"], "Value at expiry 58 − 50 = 8, minus the premium of 3 = 5."],
    ["Theta measures…", ["The loss of value due to time", "Sensitivity to price", "Volume"], "Theta is the daily erosion of time value."]
  ]
};

// ---- c06.js
T.c.crypto2 = {
  title: "Advanced crypto: wallets, DeFi, security",
  sub: "Keeping your crypto safe, understanding DeFi, reading on-chain data.",
  level: "Intermediate",
  lessons: [
    ["Platform or personal wallet?", `<p>On a platform, the platform holds the keys: convenient, but if it goes bankrupt (FTX!) or freezes your account, you depend on it. With [[self-custody|self-custody]], you hold your own keys: nobody can freeze your funds… but nobody can recover them if you lose your [[seed|recovery phrase]].</p>
<p>A common compromise: small trading amounts on a regulated platform, long-term savings in a personal wallet (ideally a hardware one).</p>`],
    ["The 5 security rules", `<ol>
<li>Your seed phrase: on paper, never photographed, never in the cloud, never given to anyone (no "support" team will ever ask for it).</li>
<li>Two-factor authentication with an app, not by SMS.</li>
<li>Check website addresses (fake sites copy everything).</li>
<li>Don't sign a transaction you don't understand: some authorise a contract to empty your wallet.</li>
<li>Be wary of airdrops and free NFTs received for no reason.</li>
</ol>`],
    ["DeFi made clear", `<p>[[defi|DeFi]] lets you swap, lend or borrow through programs (smart contracts), without a bank. The advertised yields can be high… because the risks are: contract bugs, hacks, collapse of the reward token, [[rug|rug pulls]].</p>
<p>A "stable" 20% annual yield on a [[stablecoin]] should make you ask: <b>where does that money come from?</b> (That was exactly the case with Terra/Luna.)</p>`],
    ["Reading on-chain data", `<p>On a public blockchain, everything is visible: big transfers by [[whale|whales]], inflows to platforms (often to sell), outflows (often to hold), perpetuals' [[funding|funding rate]], liquidated positions.</p>
<p>This data helps gauge sentiment, but predicts nothing on its own. It complements technical analysis and macro.</p>`]
  ],
  key: ["Platform = convenient but counterparty risk", "Seed phrase = total access, never shared", "High yield = high risk, ask where it comes from", "On-chain data measures sentiment, it doesn't predict"],
  quiz: [
    ["A \"support agent\" asks for your seed phrase to unlock your account. You…", ["Give it", "Refuse: it's a scam", "Give half of it"], "No legitimate support team ever asks for your recovery phrase."],
    ["Why is a platform going bankrupt a risk for you?", ["It holds the keys to your crypto", "It changes the price of Bitcoin", "It isn't a risk"], "On a platform, your crypto is in its custody: if it goes bankrupt, you can lose everything."]
  ]
};

T.c.forex = {
  title: "Forex in detail",
  sub: "Sessions, pairs, pips, lots, spreads: the biggest market in the world.",
  level: "Intermediate",
  lessons: [
    ["Major, minor and exotic pairs", `<p><b>Majors</b>: include the dollar and a big currency (EUR/USD, USD/JPY, GBP/USD…). Tiny spreads, huge liquidity.<br><b>Minors</b>: no dollar (EUR/GBP, EUR/JPY).<br><b>Exotics</b>: an emerging-market currency (USD/ZAR, EUR/TRY). Wide spreads, brutal moves.</p>
<p>Reading a pair: EUR/USD = 1.16 means 1 euro is worth 1.16 dollars. If you buy EUR/USD, you're betting the euro will rise against the dollar.</p>`],
    ["Pips, lots and what a move is worth", `<p>One [[pip]] = 0.0001 on most pairs (0.01 on yen pairs). Size is measured in [[lot|lots]]: 1 lot = 100,000 units, 0.1 lot (mini) = 10,000, 0.01 (micro) = 1,000.</p>
<pre>On EUR/USD:
1 lot     → 1 pip ≈ $10
0.1 lot   → 1 pip ≈ $1
0.01 lot  → 1 pip ≈ $0.10</pre>
<p>A 30-pip stop with 1 lot = about $300 of risk. ALWAYS calculate it before entering.</p>`],
    ["Sessions: when the market moves", `<p>Forex runs 24 hours a day on weekdays, but activity follows the sun:</p>
<ul><li><b>Asia (Tokyo)</b>: calm, except on the yen.</li><li><b>London</b>: the most active session (GMT, which is Mali's time zone).</li><li><b>New York</b>: high volatility, especially during the overlap with London and around US data ([[nfp|NFP]], [[cpi|CPI]]).</li></ul>
<p>The spread often widens at night and around announcements.</p>`],
    ["What moves a currency", `<p>Interest [[taux-directeur|rate]] differentials between central banks (money goes where it's better paid — that's the [[carry-trade|carry trade]]), inflation, growth, and risk sentiment (in a panic, the dollar, the yen and the Swiss franc often rise).</p>`]
  ],
  key: ["Majors = low spreads, exotics = danger", "1 lot of EUR/USD ≈ $10 per pip", "London + New York = the most active hours", "Interest rates drive currencies"],
  quiz: [
    ["You trade 0.1 lot of EUR/USD with a 40-pip stop. Approximate risk?", ["$4", "$40", "$400"], "0.1 lot ≈ $1 per pip × 40 pips = $40."],
    ["Which session is the most active?", ["Tokyo", "London", "Sydney"], "London accounts for the largest share of global forex volume."]
  ]
};

T.c.plan = {
  title: "Building your trading plan",
  sub: "The document that separates traders from gamblers.",
  level: "Essential",
  lessons: [
    ["The plan fits on one page", `<ol>
<li><b>Markets & hours</b>: what and when I trade.</li>
<li><b>Setup</b>: the 1-2 strategies I apply, with precise entry rules.</li>
<li><b>Risk</b>: max % per trade ([[regle-1pc|1%]]), max loss per day and per week, max [[levier|leverage]].</li>
<li><b>Exits</b>: where the [[stop-loss]] goes, when I take profits.</li>
<li><b>Forbidden</b>: no trading on emotion, no trading before a big announcement, no trading after 2 losses in a row.</li>
</ol>`],
    ["The journal: your best coach", `<p>For each trade: date, asset, setup, entry, stop, target, size, result, <b>emotion</b>, plan followed yes/no, screenshot of the chart.</p>
<p>Every week: read it back. You'll discover that your losses often come from the same mistakes (time of day, asset, fatigue, FOMO). That's where progress happens.</p>`],
    ["The road to real money", `<ol>
<li>[[backtest|Backtest]] your strategy (Algo Lab or by hand on historical data).</li>
<li>[[paper-trading|Paper trading]]: 50+ trades following the plan (Live + Missions here).</li>
<li>Real money with a tiny amount: the goal is to follow the plan, not to win.</li>
<li>Increase size gradually, only if the statistics stay good.</li>
</ol>`],
    ["The numbers to track", `<ul><li>[[win-rate|Win rate]] and average win / average loss (→ expectancy).</li><li>[[profit-factor|Profit factor]].</li><li>Maximum [[drawdown]].</li><li>% of trades where the plan was followed (the most important at the start).</li></ul>`]
  ],
  key: ["Written plan BEFORE trading", "Journal = progress", "Backtest → paper → small real → size up", "Measure plan compliance, not just PnL"],
  quiz: [
    ["What's the priority when you start trading with real money?", ["Win as much as possible", "Follow your plan", "Trade a lot"], "Following the plan builds habits; gains come afterwards."],
    ["A trading journal should record your emotion at the time of the trade.", ["True", "False"], "Emotions explain a large share of repeated mistakes."]
  ]
};

T.c.argent = {
  title: "You and money: the basics before trading",
  sub: "Budget, emergency fund, compound interest, inflation.",
  level: "Beginner",
  lessons: [
    ["The order of steps", `<ol>
<li>A budget (even a simple one): knowing where your money goes.</li>
<li>Pay off expensive debts.</li>
<li>An [[epargne-precaution|emergency fund]]: 3 to 6 months of expenses, available immediately.</li>
<li>Invest regularly for the long term ([[dca|DCA]]).</li>
<li>Only then: a small portion for active trading.</li>
</ol>
<p>Trading with your rent money guarantees bad decisions under pressure.</p>`],
    ["The 50/30/20 rule", `<p>A simple starting point: <b>50%</b> of income for needs (housing, food, transport), <b>30%</b> for wants, <b>20%</b> for saving and investing. Adapt it to your situation, but keep the idea: <b>pay yourself first</b> — savings go out as soon as the money comes in.</p>`],
    ["The magic of compound interest", `<p>With [[interets-composes|compound interest]], your gains generate gains of their own. The <b>rule of 72</b>: 72 ÷ annual return = number of years to double. At 8% a year, your capital doubles in ~9 years.</p>
<pre>50,000 CFA francs a month for 20 years, at 8%/year
→ 12 million paid in
→ about 29 million at the end</pre>
<p>Your biggest asset is your age: every extra year counts enormously.</p>`],
    ["Inflation, the silent enemy", `<p>[[inflation|Inflation]] eats away at the purchasing power of idle money. With 3% inflation a year, 100,000 CFA francs are worth only about 74,000 in purchasing power after 10 years.</p>
<p>Hence the point of investing part of your long-term savings… without ever forgetting that any investment that pays more carries more risk.</p>`]
  ],
  key: ["Budget → debts → emergency fund → invest → trade", "Pay yourself first", "Rule of 72: 72 ÷ rate = years to double", "Idle money loses value"],
  quiz: [
    ["At a 6% annual return, how many years to double (rule of 72)?", ["6 years", "12 years", "20 years"], "72 ÷ 6 = 12 years."],
    ["What should you build up BEFORE you start trading?", ["An emergency fund", "A leveraged account", "An NFT collection"], "An emergency fund means you won't have to sell or trade under the pressure of an unexpected event."]
  ]
};

// ---- c07.js
T.c.volatilite = {
  title: "Options level 2: volatility",
  sub: "Implied vs realised, smile, surface: what really sets an option's price.",
  level: "Pro",
  lessons: [
    ["Volatility is the real price of an option", `<p>For an option, everything is known (asset price, [[strike]], expiry, rates) except one thing: <b>how much the market is going to move</b>. That's [[vol-implicite|implied volatility]]. Pros don't say "this call costs €2", they say "it trades at 8 vol".</p>
<p>Example: EUR/USD at 1.0850. A 1-month call costs about 0.6 cents at 7% vol, and nearly double at 14%. Same option, same day: only the expectation has changed.</p>`],
    ["Implied vs realised: are options expensive?", `<p>[[vol-realisee|Realised volatility]] measures how much the market actually moved. If implied vol is 10% and the market only moves at 6%, option buyers are overpaying: time ([[theta]]) eats them faster than moves pay them.</p>
<p>The realised / implied ratio is desks' favourite indicator: below 85%, options are rather expensive; above 110%, rather cheap. Before an announcement (central bank, earnings), implied vol rises; afterwards, it collapses even if the price moves: that's the "vol crush".</p>`],
    ["Smile and skew: fear has a price", `<p>If the market were perfectly calm, all options would have the same volatility. In reality, far-out puts (crash protection) cost more: they draw a [[smile]] or a slope (skew).</p>
<ul>
<li>The <b>[[risk-reversal|risk reversal]]</b> measures the slope: call vol minus put vol at the same distance. Negative = the market fears a drop.</li>
<li>The <b>butterfly</b> measures the curvature: how much more expensive far-out options (on both sides) are than the at-the-money one. High = the market fears a big move, whichever way.</li>
</ul>`],
    ["The vol surface and the term structure", `<p>For each expiry (1 week, 1 month, 3 months, 1 year…) and each strike, there's a volatility: that's the <b>volatility surface</b>. Its slice by expiry, at the current price, is called the term structure.</p>
<p>In calm times, long-dated vol is slightly higher than short-dated vol. In a crisis, it's the reverse: 1-week vol explodes, because everyone wants protection right now. An inverted structure is a stress signal to watch.</p>`],
    ["Gamma and vega: an option seller's two risks", `<ul>
<li><b>[[gamma|Gamma]]</b>: whoever sells options is "short gamma". Every big move makes them lose, and their [[delta]] changes fast. They collect theta in return.</li>
<li><b>[[vega|Vega]]</b>: how much you gain or lose if implied volatility rises by one point. Option sellers lose when fear rises.</li>
<li><b>Vanna and volga</b> (desk level): how delta changes with vol, and how vega changes with vol. They're what make books suffer during crashes.</li>
</ul>
<p>Rule: don't sell options without knowing how much you lose if the market moves 5% <i>and</i> vol doubles. Test it in the Options Lab.</p>`]
  ],
  key: ["An option's price depends mainly on expected volatility", "Compare implied and realised to know if it's expensive", "Negative skew = the market pays for downside protection", "Selling options = short gamma: big moves hurt"],
  quiz: [
    ["Implied vol is 12%, realised vol 6%. Options are rather…", ["Expensive", "Cheap", "Fairly priced"], "The market moves half as much as option prices anticipate: the buyer overpays."],
    ["A 25-delta risk reversal of −1% means…", ["Puts are more expensive than calls", "Calls are more expensive than puts", "The market is calm"], "Call vol minus put vol is negative: downside protection costs more."],
    ["After the central bank decision, implied vol collapses. Your call…", ["Loses value even if the price doesn't move", "Gains value", "Doesn't change"], "That's the vol crush: your position is long vega."]
  ]
};

T.c["market-making"] = {
  title: "In a market maker's shoes",
  sub: "Price requests, spread, adverse selection, hedging, journal: life on an options desk.",
  level: "Pro",
  lessons: [
    ["The job: quoting a price, not betting", `<p>A [[market-maker|market maker]] doesn't try to guess direction. They constantly quote a buy price ([[bid]]) and a sell price ([[ask]]), and earn the gap ([[spread]]) across thousands of trades. Their enemy isn't the fall or the rise: it's the risk they keep after trading.</p>
<p>In options, clients (funds, companies, asset managers) send [[rfq|requests for quotes]] to several banks. The best price wins. Too expensive: you never trade. Too cheap: you trade, but you lose.</p>`],
    ["Building your price", `<ol>
<li><b>Theoretical value</b>: the model price using market volatility (Black-Scholes, or Garman-Kohlhagen for FX).</li>
<li><b>Spread</b>: wider if the product is complex, the size large or the market choppy.</li>
<li><b>Inventory skew</b>: if your book is already heavily exposed to the upside, you offer a less generous bid so you don't take on more, and a more attractive offer to get rid of some.</li>
</ol>
<p>Before answering, a good trader asks: "if I win this trade, what does my book look like?" Delta, gamma, vega after the trade, and the hedge to do straight away.</p>`],
    ["Adverse selection: when you win, be wary", `<p>Not all clients are equal. A very well-informed macro fund only trades with you if your price is wrong in its favour. That's [[selection-adverse|adverse selection]]: you mostly win the trades you should have lost.</p>
<p>So desks rank their clients: they widen the spread for the best-informed and tighten it for "natural" clients (a company hedging its imports). If you win every price request, it's not good news: your prices are probably too low.</p>`],
    ["Hedging: delta hedging and gamma scalping", `<p>After a trade, you neutralise direction with a [[delta-hedge|delta hedge]]: if the book makes €300,000 when the euro rises a notch, you sell the equivalent in spot euros.</p>
<p>A <b>long gamma</b> book (option buyer) can "scalp": with every big move, it re-hedges its delta and pockets a small gain. It has to earn more than time costs it. The minimum move to break even can be calculated: √(2 × |theta| ÷ gamma). A <b>short gamma</b> book collects theta but has to re-hedge more often when the market runs away.</p>`],
    ["Measure, test, write", `<ul>
<li><b>P&L attribution</b>: every evening, the desk breaks down its result (delta, gamma, vega, theta, hedging). A gain that comes from lucky direction isn't skill.</li>
<li><b>Limits and stress tests</b>: every book has delta, vega and gamma limits. Scenarios are replayed (flash crash, central bank surprise): "what if the euro loses 3% and vol doubles?". That's the "What if?" button on your live position.</li>
<li><b>Journal</b>: write down why you quoted a given price and what happened. After a month, you know which clients and products make you money.</li>
</ul>`]
  ],
  key: ["A market maker earns the spread, not the direction", "Before quoting, look at your book after the trade", "Winning every request = prices too low", "Hedge, stress-test, keep a journal"],
  quiz: [
    ["Your book is already very long delta. A client wants to sell you more upside. You…", ["Offer a less generous bid", "Offer a more generous price", "Change nothing"], "That's inventory skew: you avoid adding to an exposure that's already large."],
    ["You win 95% of price requests. The most likely explanation?", ["Your prices are too low", "You're the best trader", "Clients like you"], "Adverse selection: clients pick the prices that are wrong in their favour."],
    ["Gamma of €2,000 per point², theta of −€400 per day. Minimum move to break even?", ["√(2 × 400 ÷ 2,000) ≈ 0.63 points", "400 ÷ 2,000 = 0.2 points", "2,000 ÷ 400 = 5 points"], "0.5 × gamma × move² = |theta|, so move = √(2 × |theta| ÷ gamma)."]
  ]
};

T.c["options-change"] = {
  title: "FX options: hedging against the dollar",
  sub: "FX forwards, currency options, and the case of a Malian importer.",
  level: "Advanced",
  lessons: [
    ["The CFA franc, the euro and the dollar", `<p>The [[fcfa|CFA franc]] is pegged to the euro (€1 = 655.957 CFA francs). But many purchases are made in dollars: fuel, rice, machinery, phones. When the dollar rises against the euro, they cost more in CFA francs. For a Malian company that imports, the EUR/USD rate is therefore a real risk.</p>
<p>Example: an importer must pay $100,000 in 3 months. At 1.10 dollars to the euro, that's about 59.6 million CFA francs. If the euro falls to 1.00 dollar, the same invoice costs 65.6 million: 6 million more, without having done anything wrong.</p>`],
    ["The FX forward: locking in your rate", `<p>With a [[forward|forward contract]], the bank sets today the rate for the future date. That rate isn't the spot rate: it's adjusted by the interest rate gap between the two currencies (the "forward points"). If dollar rates are higher than euro rates, the forward dollar costs slightly less.</p>
<p>Advantage: no more surprises. Drawback: if the market moves in your favour, you don't benefit.</p>`],
    ["The currency option: insurance", `<p>With an option, the importer buys the right to buy their dollars at a capped rate. If the dollar rises, the option protects them. If it falls, they let the option expire and buy more cheaply in the market. The cost: the [[prime|premium]], paid up front.</p>
<p>The price is calculated with the Garman-Kohlhagen model, a version of Black-Scholes that takes both interest rates into account. The desks that sell these options then manage their risk as in the "market maker" module.</p>`],
    ["Choosing between the two", `<ul>
<li><b>Certain amount and date</b> (a signed invoice): the forward is simple and has no premium.</li>
<li><b>Uncertain amount</b> (a tender not yet won): the option, because you're not obliged to exercise it.</li>
<li><b>Tight budget</b>: hedge part of it (50 to 70%) with a forward and leave the rest open.</li>
</ul>
<p>In Mali and the WAEMU, these products go through commercial banks and are regulated by the [[bceao|BCEAO]]. They're for hedging real business activity, not for speculating.</p>`]
  ],
  key: ["The CFA franc follows the euro: the risk is EUR/USD", "Forward = locked rate, no premium", "Option = protection + chance to benefit, for a premium", "Hedging part of the amount is often the right compromise"],
  quiz: [
    ["A Malian importer pays in dollars in 3 months. Which move hurts them?", ["The euro falls against the dollar", "The euro rises against the dollar", "The CFA franc stays fixed to the euro"], "The CFA franc follows the euro: if the euro falls, it takes more CFA francs to pay the same dollars."],
    ["The contract isn't signed yet. The best tool?", ["The currency option", "The forward", "Do nothing"], "With the option, they aren't obliged to buy the dollars if the contract falls through."]
  ]
};

// ---- g01.js
Object.assign(T.g, {
  bid: ["Bid (buy price)", "The best price a buyer is willing to pay right now. If you sell at market, you sell at the bid."],
  ask: ["Ask (sell price)", "The best price at which someone is willing to sell. If you buy at market, you pay the ask."],
  spread: ["Spread", "The gap between the bid and the ask. It's a hidden cost you pay on every round trip. The more liquid the asset, the tighter it is."],
  carnet: ["Order book", "The list of all pending buy and sell orders, ranked by price. It's where the price is formed."],
  "ordre-marche": ["Market order", "\"Fill it right now, at the best available price.\" Fast, but you don't control the exact price (risk of slippage)."],
  "ordre-limite": ["Limit order", "\"Buy only if the price drops to X\" (or sell at X). You control the price, but the order may never be filled."],
  "stop-loss": ["Stop-loss", "An order that automatically cuts your position if the price moves against you to a set level. Your airbag: it limits the loss."],
  "take-profit": ["Take-profit", "An order that automatically cashes in the gain when the price reaches your target."],
  "trailing-stop": ["Trailing stop", "A stop-loss that moves up with the price when it goes your way, but never moves back down. It locks in gains."],
  slippage: ["Slippage", "The difference between the expected price and the price actually obtained. Common when the market moves fast or lacks liquidity."],
  liquidite: ["Liquidity", "How easily you can buy/sell without moving the price. BTC, EUR/USD, Apple: very liquid. An obscure memecoin: not at all."],
  volatilite: ["Volatility", "The size of price swings. High volatility = more opportunities, but also more risk per unit of position."],
  volume: ["Volume", "The quantity traded over a period. A move with volume is more \"credible\" than one without."],
  gap: ["Gap", "A hole between one period's close and the next one's open. Your stop can be filled much further away than planned."],
  timeframe: ["Timeframe", "The length of time one candle represents: 1 minute, 1 hour, 1 day… The same asset tells a different story depending on the timeframe."],
  long: ["Long (buyer)", "You bet on a rise: you buy now to sell higher later."],
  short: ["Short (seller)", "You bet on a fall: you sell first (a borrowed asset) and buy back lower. Theoretically unlimited loss if it rises."],
  pnl: ["PnL (Profit and Loss)", "Your gain or loss. \"Unrealised\" while the position is open, \"realised\" once it's closed."],
  levier: ["Leverage", "An exposure multiplier. With ×10, a 1% move = 10% of your stake. It works in BOTH directions."],
  marge: ["Margin", "The money you tie up to open a leveraged position. It's what you can lose before being liquidated."],
  liquidation: ["Liquidation", "Forced closure of your position by the broker when your loss has eaten your margin. With ×10, a drop of about 10% is enough."],
  drawdown: ["Drawdown (max loss)", "The maximum fall of your capital from a peak. −50% takes +100% to get back to where you were."],
  rr: ["Risk/reward ratio (R:R)", "What you can gain compared with what you risk. 1:2 = you risk 100 to aim for 200. With 1:2, a 40% win rate is enough."],
  sizing: ["Position sizing", "Calculating your position size from your stop: size = (capital × risk %) ÷ distance to stop."],
  "regle-1pc": ["1% rule", "Never risk more than 1-2% of your capital on a single trade. Even 10 losses in a row won't knock you out of the game."],
  equity: ["Equity (account value)", "Cash + unrealised value of your positions. It's your real balance at any given moment."],
  frais: ["Fees", "A commission charged on every order. Here 0.1% per execution, as on many crypto platforms. Overtrading makes them explode."],
  "paper-trading": ["Paper trading", "Trading with virtual money on real prices. The best way to learn without paying for your mistakes."],
  chandelier: ["Candle (Japanese candlestick)", "Sums up a period: open, high, low, close. Green = close above the open, red = below."],
  meche: ["Wick", "The thin line above/below the candle's body. A long wick = the price went far, then was rejected."],
  tendance: ["Trend", "Uptrend = higher and higher highs and lows. Downtrend = the opposite. \"The trend is your friend\"."],
  support: ["Support", "A price zone where buyers have already shown up in force. The price tends to bounce there… until the day it breaks."],
  resistance: ["Resistance", "A zone where sellers have already blocked the rise. A broken resistance often becomes support."],
  breakout: ["Breakout", "The price leaves a zone (range, resistance) with strength. Often the start of a new move."],
  "faux-breakout": ["Fake breakout", "A break that fails and returns into the zone. The markets' favourite trap — hence the use of a stop."],
  range: ["Range (sideways market)", "The price oscillates between a ceiling and a floor with no clear direction. Trend strategies lose there; mean reversion wins."],
  sma: ["SMA (simple moving average)", "The average of the last N closes. Smooths out noise. Price above the SMA = bullish bias."],
  ema: ["EMA (exponential moving average)", "A moving average that gives more weight to recent prices. Reacts faster than the SMA."],
  rsi: ["RSI (Relative Strength Index)", "An oscillator from 0 to 100 measuring the strength of recent moves. >70 = overbought, <30 = oversold. In a strong trend, it can stay there a long time."],
  macd: ["MACD", "The difference between a 12 EMA and a 26 EMA, compared with its own average (signal). Bullish cross = momentum picking up."],
  bollinger: ["Bollinger Bands", "A 20 SMA surrounded by 2 standard deviations. The bands widen when volatility rises and tighten before big moves."],
  atr: ["ATR (Average True Range)", "The average size of a candle over 14 periods. Perfect for placing a stop \"at the right distance\" from the noise."],
  vwap: ["VWAP", "The volume-weighted average price since the start of the session. Institutions' benchmark for judging whether they \"bought well\"."],
  donchian: ["Donchian channel", "The highest high and lowest low of the last N candles. The basis of the famous Turtles strategy."],
  momentum: ["Momentum", "What goes up tends to keep going up (in the medium term). One of the best-documented market anomalies."],
  "mean-reversion": ["Mean reversion", "The idea that a price too far from its average eventually comes back to it. Works well in ranges, very badly in strong trends."],
  divergence: ["Divergence", "The price makes a new high but the indicator (RSI, MACD) doesn't. A sign the move is running out of steam."],
  backtest: ["Backtest", "Testing a strategy on past data to see how it would have performed. Essential, but the past guarantees nothing."],
  overfitting: ["Overfitting", "Tuning a strategy so precisely to the past that it no longer works in the future. The no. 1 trap in algo trading."],
  sharpe: ["Sharpe ratio", "Return divided by volatility. Measures whether the gain was worth the stress. > 1 = good, > 2 = excellent (and often suspicious in a backtest)."],
  "win-rate": ["Win rate", "The percentage of winning trades. A 35% win rate can be very profitable if wins are big and losses small."],
  "profit-factor": ["Profit factor", "Sum of gains ÷ sum of losses. > 1 = winning strategy, > 1.5 = solid."],
  "z-score": ["Z-score", "How many standard deviations a value is from its average. Z = 2: that's rare, it might come back."],
  pairs: ["Pairs trading", "Buying one asset and selling a related one (e.g. ETH against BTC) when their spread becomes abnormal, betting it will close."],
  "look-ahead": ["Look-ahead bias", "A backtesting error where the strategy unintentionally uses information from the future. Result: unrealistic performance."],
  hft: ["HFT (high-frequency trading)", "Algorithms that place thousands of orders per second, with servers right next to the exchanges. Out of reach for retail traders."],
  "market-maker": ["Market maker", "A player who constantly quotes a buy AND a sell price and earns the spread. They provide the market's liquidity."],
  twap: ["TWAP / VWAP (execution)", "Algos that slice a big order into small pieces over time so as not to move the price."],
  dca: ["DCA (Dollar Cost Averaging)", "Investing the same amount at regular intervals, whatever the price. Simple, anti-FOMO, formidably effective over the long term."],
  action: ["Share", "A slice of ownership in a company. You profit from a rising share price and from dividends."],
  etf: ["ETF (tracker)", "A listed fund that tracks an index (S&P 500, MSCI World…). Instant diversification, very low fees."],
  indice: ["Index", "A basket of shares that measures a market: CAC 40, S&P 500, Nasdaq 100. You don't buy it directly; you go through an ETF or a derivative."],
  obligation: ["Bond", "A loan to a government or a company, paid with a coupon. When rates rise, the price of existing bonds falls."],
  forex: ["Forex", "The currency market (EUR/USD, USD/JPY…). The biggest market in the world: more than $7 trillion traded every day."],
  pip: ["Pip", "The smallest standard move in a currency pair: 0.0001 for EUR/USD."],
  crypto: ["Cryptocurrency", "A digital asset on a blockchain. The market is open 24/7, very volatile, and much less regulated than the traditional stock market."],
  stablecoin: ["Stablecoin", "A crypto pegged to a currency (USDT, USDC ≈ $1). It serves as \"cash\" in the crypto ecosystem."],
  futures: ["Future (futures contract)", "A commitment to buy/sell an asset at a future date at a price set today. Traded with leverage, via margin."]
});

// ---- g02.js
Object.assign(T.g, {
  perpetuel: ["Perpetual (perp)", "A crypto future with no expiry date. Its price is tied to spot through the funding rate. The exchanges' star (and dangerous) product."],
  funding: ["Funding rate", "A periodic payment between longs and shorts on perpetuals. Very positive funding = everyone is long = an overheated market."],
  option: ["Option", "The RIGHT (not the obligation) to buy (call) or sell (put) an asset at a fixed price. You pay a premium for that right."],
  call: ["Call", "A buy option. Gains value when the underlying rises."],
  put: ["Put", "A sell option. Gains value when the underlying falls. Often used as insurance."],
  "0dte": ["0DTE options", "Options that expire the same day. Hugely popular on the S&P 500 since 2023 — and hugely risky: they can be worth 0 within hours."],
  cfd: ["CFD", "Contract for difference: you bet on a price change without owning the asset, with leverage. 70 to 80% of retail accounts lose money (figures displayed by the brokers themselves)."],
  "matieres-premieres": ["Commodities", "Gold, oil, wheat, copper… Driven by supply, demand, geopolitics and the dollar."],
  dividende: ["Dividend", "A share of profits paid out to shareholders. The share price falls by roughly the same amount on the ex-dividend date."],
  per: ["P/E (Price Earnings Ratio)", "Market cap ÷ annual profit. How many years of profits you're paying for. High P/E = the market expects a lot of growth."],
  capitalisation: ["Market capitalisation", "Share price × number of shares = the value of the whole company on the stock market."],
  rwa: ["Tokenisation (RWA)", "Representing a real-world asset (bond, share, gold) as a token on a blockchain. One of the big trends of 2024-2026."],
  inflation: ["Inflation", "The general rise in prices. When it climbs, central banks raise rates, which weighs on risky assets."],
  "taux-directeur": ["Policy rate", "The rate at which the central bank lends to banks. It's the \"price of money\": it influences every market."],
  fed: ["Fed", "The US central bank. Its interest rate decisions move the whole world, crypto included."],
  bce: ["ECB", "European Central Bank. It sets interest rates for the euro area."],
  cpi: ["CPI", "The US consumer price index, published every month. One of the numbers that moves markets the most."],
  nfp: ["NFP", "Non-Farm Payrolls: US job creation, published on the 1st Friday of the month. Guaranteed volatility."],
  earnings: ["Quarterly earnings", "The accounts companies publish every quarter. A share can move ±10% overnight."],
  halving: ["Halving", "The halving of the Bitcoin miners' reward, every ~4 years (the latest: April 2024). Reduces the new supply of BTC."],
  "carry-trade": ["Carry trade", "Borrowing in a low-rate currency (e.g. the yen) to invest in a high-rate one. Profitable… until the brutal unwinding."],
  scalping: ["Scalping", "Dozens of trades a day, lasting seconds to minutes. Fees and spread are your worst enemies."],
  "day-trading": ["Day trading", "Opening and closing your positions within the day. No overnight risk, but lots of screen time and stress."],
  swing: ["Swing trading", "Holding a position for a few days to a few weeks to catch a \"wave\". Compatible with a job or studies."],
  "position-trading": ["Position trading", "Positions held for several months, based on major trends and macro."],
  fomo: ["FOMO", "Fear Of Missing Out: buying because \"everyone's winning\" and you're afraid of missing the boat. Often at the top."],
  fud: ["FUD", "Fear, Uncertainty, Doubt: negative rumours that push people to panic-sell."],
  revenge: ["Revenge trading", "Taking a bigger trade right after a loss to \"win it back\". The fastest way to empty an account."],
  bull: ["Bull market", "A prolonged rising market. Everyone thinks they're a genius."],
  bear: ["Bear market", "A falling market (often −20% or more from the peak). Where you really learn."],
  ath: ["ATH", "All-Time High: an asset's highest price ever."],
  whale: ["Whale", "A player who holds so much of an asset that their orders move the price."],
  "pump-dump": ["Pump & dump", "A scam: a group drives up an illiquid asset (hype, social media), then sells everything to the latecomers."],
  rug: ["Rug pull", "A token's creators pull all the liquidity and vanish with the money."],
  "prop-firm": ["Prop firm", "A company that \"funds\" an account for you if you pass a paid challenge. Many make most of their money from the challenge fees of those who fail."],
  mica: ["MiCA", "The European regulation on crypto-assets, fully applicable since late 2024. Platforms must be licensed to serve Europeans."],
  amf: ["AMF", "The Autorité des marchés financiers, France's stock market watchdog. It publishes blacklists of unauthorised sites: always check before depositing."],
  kyc: ["KYC", "Know Your Customer: mandatory identity checks at regulated brokers. A platform that doesn't ask for it = red flag."],
  pea: ["PEA / CTO", "In France, the PEA (European shares, favourable tax treatment after 5 years) and the ordinary securities account (everything else)."],
  brvm: ["BRVM", "Bourse Régionale des Valeurs Mobilières, based in Abidjan. The stock exchange shared by the 8 WAEMU countries, including Mali."],
  uemoa: ["WAEMU (UEMOA)", "West African Economic and Monetary Union: Benin, Burkina Faso, Côte d'Ivoire, Guinea-Bissau, Mali, Niger, Senegal, Togo. Common currency: the CFA franc."],
  bceao: ["BCEAO", "Central Bank of West African States. It sets the WAEMU's policy rates and supervises banks, e-money and payments."],
  fcfa: ["CFA franc (XOF)", "The WAEMU's currency, pegged to the euro at a fixed rate: €1 = 655.957 CFA francs."],
  sgi: ["SGI", "Société de gestion et d'intermédiation: the licensed broker that sends your orders to the BRVM and keeps your securities account."],
  "amf-umoa": ["AMF-UMOA", "Financial Markets Authority of the West African Monetary Union: the regional exchange's watchdog (formerly CREPMF)."],
  strike: ["Strike (exercise price)", "The price at which an option lets you buy (call) or sell (put) the asset."],
  prime: ["Premium", "The price paid to buy an option. It's the buyer's maximum loss."],
  delta: ["Delta", "How much the option's price moves when the asset moves by 1. A delta of 0.5 = the option gains ~€0.50 when the share gains €1."],
  theta: ["Theta", "The value an option loses with each day that passes. Time works against the option buyer."],
  "valeur-temps": ["Time value", "The part of the premium that pays for the hope of a move before expiry. It melts to zero at expiration."],
  seed: ["Recovery phrase (seed)", "12 or 24 words that give total access to a crypto wallet. Anyone who knows them can empty it. NEVER give it out."],
  defi: ["DeFi", "Decentralised finance: loans, swaps and yields run by smart contracts, without a bank. Innovative, but bugs and hacks are frequent."],
  "self-custody": ["Self-custody", "Keeping your crypto in your own wallet (you hold the keys) rather than on a platform."],
  lot: ["Lot", "The unit of size in forex. 1 standard lot = 100,000 units of the base currency; 0.01 lot (micro-lot) = 1,000."],
  "interets-composes": ["Compound interest", "Gains generate gains of their own. Over the long term, it's the most powerful force in investing."],
  "epargne-precaution": ["Emergency fund", "A reserve of money available immediately (3 to 6 months of expenses) for the unexpected. To build BEFORE investing."],
  "flux-tresorerie": ["Cash flow", "The money a company actually collects. Harder to dress up than accounting profit."],
  vega: ["Vega", "How much an option's price moves when expected volatility rises by one point (e.g. from 20% to 21%)."],
  gamma: ["Gamma", "How fast delta changes when the price moves. Positive gamma: big moves help you; negative: they hurt you."],
  "vol-implicite": ["Implied volatility", "The size of move the market expects, derived from option prices. The higher it is, the more expensive options are."],
  "vol-realisee": ["Realised volatility", "The size of move actually observed over a past period. Compared with implied volatility to tell whether options are expensive."],
  smile: ["Volatility smile", "Options far from the current price often have higher implied volatility than those at the current price: the curve forms a smile or a slope (skew)."],
  "risk-reversal": ["Risk reversal", "The volatility difference between a call and a put at the same distance from the price. Negative: the market pays more for downside protection."],
  "delta-hedge": ["Delta hedging", "Buying or selling the asset to cancel out your options' delta, so you no longer depend on the market's direction."],
  rfq: ["RFQ (request for quote)", "A client asks several banks or market makers for a price and trades with the best one."],
  "selection-adverse": ["Adverse selection", "The risk of trading mostly with people who know more than you: your best-informed clients pick your prices when they're wrong."],
  forward: ["FX forward", "An agreement to exchange two currencies at a future date, at a rate set today. It depends on the interest rate gap between the two currencies."]
});

// ---- m01.js
Object.assign(T.m, {
  covid: { title: "Covid's Black Thursday", year: "March 2020", diff: "Extreme", teaser: "The world discovers a pandemic. Stock markets wobble. Will Bitcoin, \"digital gold\", act as a safe haven?", story: "On 12 March 2020, global panic peaks: stock markets collapse and Bitcoin loses about 40% in 24 hours, briefly falling below $4,000. Hundreds of millions of dollars of leveraged positions are liquidated. Those who had a stop limited the damage; those who bought the panic with a small size saw BTC… pass $60,000 a year later.", lesson: "In a liquidity crisis, everything gets sold — even \"safe havens\". Small size and a mandatory stop." },
  doge: { title: "Elon, SNL and Dogecoin", year: "May 2021", diff: "Hard", teaser: "A billionaire who's very active on Twitter is about to host a cult US TV show. The internet is on fire. The web's favourite memecoin is at its peak.", story: "On 8 May 2021, Elon Musk hosts Saturday Night Live and calls Dogecoin… \"a hustle\" (as a joke). DOGE, which had risen more than tenfold since the start of the year, drops about 30% during and after the show. A textbook case of \"buy the rumor, sell the news\" and collective FOMO.", lesson: "When your whole feed is talking about an asset, you're often someone's exit liquidity." },
  luna: { title: "The collapse of Terra/Luna", year: "May 2022", diff: "Hard", teaser: "A giant algorithmic stablecoin promises a 20% yield. Its reserves are in Bitcoin. Something is starting to crack…", story: "In May 2022, the UST stablecoin loses its dollar peg. To defend it, the Luna Foundation Guard sells its bitcoins, then the Terra ecosystem (over $40 billion) evaporates in a week. BTC goes from about $36,000 to nearly $26,000. It's the start of a chain of bankruptcies (Celsius, 3AC… then FTX).", lesson: "A high \"guaranteed\" yield always hides a risk. And contagion spreads faster than you think." },
  merge: { title: "Ethereum: The Merge", year: "September 2022", diff: "Medium", teaser: "The biggest upgrade in Ethereum's history is coming: the end of mining, energy use cut by ~99.9%. Everyone has been waiting for it for years.", story: "On 15 September 2022, Ethereum switches to proof of stake (\"The Merge\") without a technical hitch. And yet ETH falls about 15 to 20% in the following days: the event was expected, buyers were already positioned, and a higher-than-expected US inflation figure weighs on the whole market.", lesson: "Good news that's already known is often already in the price. Sell the news." },
  ftx: { title: "The fall of FTX", year: "November 2022", diff: "Extreme", teaser: "The world's 2nd-biggest crypto platform, sponsor of stadiums and celebrities. An article about its balance sheet has just come out. Withdrawals are speeding up…", story: "In early November 2022, revelations about the balance sheet of Alameda, the fund linked to FTX, trigger a rush of withdrawals. Within days, FTX freezes withdrawals and then goes bankrupt; its founder will be convicted of fraud. BTC drops from about $21,000 to under $16,000. Millions of users lose access to their funds.", lesson: "\"Not your keys, not your coins.\" Counterparty risk (the platform itself) is a real risk." },
  etf: { title: "Bitcoin ETFs arrive", year: "January 2024", diff: "Medium", teaser: "After 10 years of refusals, the US securities regulator is about to approve spot Bitcoin ETFs. BlackRock is in the race. Everyone is waiting for the decision.", story: "On 10 January 2024, the SEC approves 11 spot Bitcoin ETFs. Billions of dollars pour in over the following weeks… but BTC, which had risen sharply in anticipation, loses about 20% in two weeks (part of the selling coming from outflows from older funds). It then takes off again to break its records in March.", lesson: "The market anticipates. The day of the event is often when the first buyers cash in." },
  yen: { title: "The yen's Black Monday", year: "August 2024", diff: "Hard", teaser: "The Bank of Japan has just raised rates. A US jobs figure disappoints. Billions borrowed in yen are funding positions all over the world…", story: "On 5 August 2024, the massive unwinding of the yen \"carry trade\" sends the Nikkei down more than 12%, its worst session since 1987. Panic spreads to all risky assets: BTC goes from about $62,000 to under $50,000 in a few hours, before partly rebounding.", lesson: "Markets are interconnected: a central bank decision in Tokyo can liquidate your BTC long in Paris." },
  election: { title: "US election night", year: "November 2024", diff: "Medium", teaser: "The US presidential election is tomorrow. One of the candidates promises to make the US \"the crypto capital of the planet\".", story: "On 6 November 2024, Donald Trump's victory propels BTC above its $73,000 record. Within two weeks, it approaches $95,000, and it breaks $100,000 in early December. Those who followed the trend with a trailing stop captured a huge part of the move.", lesson: "When a real trend starts, the best strategy is often the simplest: follow it and let it run." },
  tariffs: { title: "Liberation Day: the tariff shock", year: "April 2025", diff: "Extreme", teaser: "The White House is about to announce new \"reciprocal\" tariffs on the whole world. Nobody knows how big they'll be.", story: "On 2 April 2025, the United States announces tariffs far higher than expected. Global stock markets collapse for several days, and BTC falls below $75,000. On 9 April, the announcement of a 90-day pause triggers one of the biggest rebounds in Nasdaq history — and BTC climbs back towards $85,000.", lesson: "Political shocks create violent moves in both directions. Shorting the bottom or buying the panic without a stop = Russian roulette." },
  gold: { title: "The gold rush", year: "2025", diff: "Easy", teaser: "Central banks buying, a weakening dollar, geopolitical tensions. Is the world's oldest safe haven too expensive?", story: "In 2025, gold sets record after record and passes $4,000 an ounce in the autumn, supported by central bank buying, expected US rate cuts and the search for safe havens. A perfect long-term trend… punctuated by brutal corrections that kicked out over-leveraged traders.", lesson: "A long-term trend is traded with patience: enter on pullbacks, stop below the lows, and don't get out at the first shiver." }
});

// ---- q01.js
T.q.u1 = { t: "Market basics", sub: "Bid, ask, spread, long, short", q: [
  ["The best price at which someone is willing to sell is called…", ["The bid", "The ask", "The spread"], "The ask is the selling price; the bid is the buying price."],
  ["Bid 99.90 / Ask 100.10. What is the spread?", ["0.10", "0.20", "100"], "100.10 − 99.90 = 0.20."],
  ["Going \"short\" means betting on a fall.", null, "You sell first to buy back lower."],
  ["The price rises when ___ are in more of a hurry than sellers.", ["buyers", "regulators", "central banks"], "Buyers \"taking\" the ask push the price up."],
  ["An unrealised gain is locked in for good.", null, "It only counts once the position is closed."],
  ["A green candle means that…", ["The close is above the open", "Volume has increased", "The price hit a record"], "Green = close > open over the period."],
  ["What do a candle's wicks show?", ["The open and the close", "The high and the low", "The volume"], "Wicks show the extremes reached."],
  ["The spread is a cost you pay on every round trip.", null, "You buy at the ask and sell back at the bid."]
] };
T.q.u2 = { t: "Orders & execution", sub: "Market, limit, stop, slippage", q: [
  ["Which order guarantees immediate execution but not the price?", ["Limit order", "Market order", "Take-profit"], "A market order is filled straight away at the best available price."],
  ["You only want to buy if the price comes back down to 95. You use…", ["A limit order at 95", "A market order", "A stop at 95"], "A limit order sets your maximum buying price."],
  ["A stop-loss is always filled exactly at its price.", null, "With a gap or a fast market, there's slippage."],
  ["The difference between the expected price and the price you get is called ___.", ["slippage", "funding", "pip"], "Slippage increases when liquidity is low."],
  ["A trailing stop…", ["Moves back when the price falls", "Rises with the price and never comes down", "Closes after one hour"], "It locks in gains as the price rises."],
  ["Moving your stop to \"breakeven\" means placing it…", ["At the entry price", "At the day's low", "Nowhere"], "The trade can no longer lose (excluding fees and gaps)."],
  ["On an illiquid asset, a limit order is often the safer choice.", null, "It avoids buying much higher than planned."],
  ["A take-profit is used to…", ["Limit the loss", "Automatically cash in the target gain", "Increase leverage"], "It closes the position when the target is reached."]
] };
T.q.u3 = { t: "The instruments", sub: "Stocks, ETFs, bonds, derivatives", q: [
  ["An S&P 500 ETF is…", ["A single US share", "A fund that tracks 500 companies", "A crypto"], "Instant diversification at low cost."],
  ["When rates rise, the price of existing bonds falls.", null, "Their fixed coupon becomes less attractive than that of new ones."],
  ["Which product gives the right, but not the obligation, to buy?", ["A put", "A call", "A future"], "A call is a buy option."],
  ["A crypto perpetual is kept close to the spot price thanks to the…", ["Funding rate", "Dividend", "Coupon"], "Longs and shorts pay each other depending on the gap."],
  ["A ___ is a loan to a government or company, paid with a coupon.", ["bond", "ETF", "CFD"], "A bond = lending rather than owning."],
  ["With a CFD, you actually own the share.", null, "A CFD is a contract on the price change, with no ownership."],
  ["A dividend is…", ["A share of profits paid to shareholders", "A broker's commission", "A tax"], "The share price drops by roughly the same amount on the ex-dividend date."],
  ["A stablecoin like USDC aims to be worth…", ["1 Bitcoin", "1 dollar", "1 gram of gold"], "It's the \"cash\" of the crypto ecosystem."]
] };
T.q.u4 = { t: "Reading a chart", sub: "Trends, supports, breakouts", q: [
  ["An uptrend is…", ["Higher and higher highs and lows", "One big green candle", "An RSI above 50"], "The structure of peaks and troughs defines the trend."],
  ["A support is a precise line, to the cent.", null, "It's a zone, not an exact line."],
  ["A resistance broken with strength often becomes…", ["A support", "Useless", "A stronger resistance"], "That's the level \"flip\"."],
  ["A break that fails and returns into the zone is a ___.", ["fake breakout", "halving", "dividend"], "The market's favourite trap, hence the use of a stop."],
  ["Which filter makes a breakout more credible?", ["A close beyond the level with volume", "A wick touching the level", "A tweet"], "Close + volume = confirmation."],
  ["A hammer (long lower wick) after a drop suggests…", ["Sellers being rejected", "The drop accelerating", "Nothing at all"], "To be confirmed by the next candle."],
  ["Round numbers ($100,000 for BTC) often act as psychological levels.", null, "Lots of orders pile up there."],
  ["Before buying on the 1h chart, it's wise to check…", ["The 4h and daily trend", "The weather", "The coin's follower count"], "You trade in the direction of the higher timeframe."]
] };
T.q.u5 = { t: "Indicators", sub: "EMA, RSI, MACD, Bollinger, ATR", q: [
  ["An RSI above 70 indicates a zone that is…", ["Oversold", "Overbought", "Neutral"], "But in a strong trend, it can stay there a long time."],
  ["RSI > 70 = sell immediately.", null, "It shows strong momentum, not a sell signal on its own."],
  ["The ATR measures…", ["Direction", "The average size of candles", "Volume"], "Ideal for placing a stop outside the noise."],
  ["When the ___ bands tighten, a big move is often brewing.", ["Bollinger", "Donchian", "Fibonacci"], "That's the volatility \"squeeze\"."],
  ["Compared with the SMA, the EMA…", ["Reacts faster to recent prices", "Reacts more slowly", "Is identical"], "It gives more weight to the latest candles."],
  ["The price makes a new high but the RSI doesn't. That's…", ["A divergence", "A gap", "A breakout"], "Momentum is running out of steam."],
  ["Institutions use the VWAP to…", ["Judge the quality of their buying price", "Calculate taxes", "Pick a crypto"], "Buying below the VWAP = \"bought well\" for the session."],
  ["Stacking 8 indicators always improves decisions.", null, "2-3 complementary indicators are enough."]
] };
T.q.u6 = { t: "Risk management", sub: "Position size, leverage, drawdown", q: [
  ["Maximum recommended risk per trade?", ["1 to 2% of capital", "10%", "50%"], "Even 10 losses in a row won't knock you out of the game."],
  ["Capital $10,000, risk 1%. How many $ do you risk per trade?", null, "10,000 × 1% = $100."],
  ["Leverage increases your probability of being right.", null, "It only increases how fast you win… or lose."],
  ["Position size is calculated from…", ["Your mood", "The distance to the stop", "The share price"], "Size = risk in $ ÷ distance to stop."],
  ["Your account loses 50%. What % gain do you need to break even?", null, "From 50 to 100, you have to double: +100%."],
  ["The maximum fall in capital from a peak is called the ___.", ["drawdown", "spread", "theta"], "Drawdown measures the maximum pain."],
  ["With an R:R of 1:3, what minimum win rate breaks even (before fees)?", ["25%", "50%", "75%"], "1 ÷ (1 + 3) = 25%."],
  ["A daily loss limit helps avoid revenge trading.", null, "It forces a break when emotions take over."]
] };

// ---- q02.js
T.q.u7 = { t: "Psychology", sub: "FOMO, revenge, biases", q: [
  ["Buying after +40% because \"everyone's winning\" is…", ["FOMO", "DCA", "Hedging"], "Fear Of Missing Out."],
  ["Doubling your size right after a loss to win it back is…", ["Revenge trading", "Discipline", "Scalping"], "The fastest way to empty an account."],
  ["A loss hurts about twice as much as an equivalent gain feels good.", null, "That's loss aversion."],
  ["Only seeing those who succeeded is ___ bias.", ["survivorship", "spread", "volume"], "You don't see the thousands who lost everything."],
  ["The biggest red flag in a \"trading coach\"?", ["He talks about stop-losses", "He promises guaranteed gains", "He shows his losses"], "No return is guaranteed in the markets."],
  ["Doing nothing can be the best trading decision.", null, "No clear setup = no trade."],
  ["Classic beginner's mistake…", ["Cutting winners early and letting losers run", "Using a stop", "Keeping a journal"], "You should do exactly the opposite."],
  ["After 2 losses in a row, the wisest move is often…", ["To take a break", "To increase leverage", "To switch strategy at random"], "A break breaks the emotional spiral."]
] };
T.q.u8 = { t: "Strategies & algos", sub: "Trend, breakout, mean reversion, pairs", q: [
  ["Which algo buys when a fast EMA crosses above a slow EMA?", ["Trend following", "Mean reversion", "Pairs trading"], "It follows momentum."],
  ["The Turtles' method is based on…", ["The Donchian channel", "RSI 2", "Dividends"], "Buy on a break of the highest high of the last N candles."],
  ["Mean reversion works very well in strong trends.", null, "It suffers in trends and shines in ranges."],
  ["Which strategy can win whether the market goes up or down?", ["Pairs trading", "Long-only trend", "Buy & hold"], "It bets on the spread between two assets."],
  ["Tuning a strategy so finely to the past that it fails in the future is ___.", ["overfitting", "halving", "arbitrage"], "Test on one period, validate on another."],
  ["A backtest without fees or slippage is realistic.", null, "Costs can turn a winning strategy into a losing one."],
  ["A Telegram bot promises a guaranteed +2% a day. It's…", ["A scam", "A good investment", "An ETF"], "+2%/day ≈ +137,000% a year: impossible."],
  ["To compare two strategies, the best return/risk indicator is…", ["The Sharpe ratio", "The number of trades", "The asset's price"], "It relates return to volatility."]
] };
T.q.u9 = { t: "Macro & news", sub: "Rates, inflation, events", q: [
  ["The Fed raises rates by surprise. Typical reaction of tech?", ["Up", "Down", "None"], "More expensive money weighs on growth valuations."],
  ["CPI measures…", ["Inflation", "Employment", "GDP"], "Consumer Price Index."],
  ["Spot Bitcoin ETFs were approved in the United States in January 2024.", null, "And BTC fell at first: sell the news."],
  ["The Bitcoin halving…", ["Halves the miners' reward", "Halves the price", "Doubles the number of BTC"], "It cuts new supply roughly every 4 years."],
  ["Borrowing in yen at low rates to invest elsewhere is called the ___.", ["carry trade", "scalping", "staking"], "Its unwinding shook markets on 5 August 2024."],
  ["In April 2025, which event caused a brutal market drop?", ["The announcement of massive US tariffs", "The halving", "A bank merger"], "Then a 90-day pause triggered a historic rebound."],
  ["NFP (US jobs) is usually published on the first Friday of the month.", null, "Guaranteed volatility that day."],
  ["The European regulation governing crypto-assets is called…", ["MiCA", "MiFID Crypto", "Basel IV"], "Fully applicable since late 2024."]
] };
T.q.u10 = { t: "West Africa & BRVM", sub: "WAEMU, CFA franc, SGI, mobile money", q: [
  ["How many countries share the BRVM?", ["5", "8", "15"], "The 8 WAEMU countries, including Mali."],
  ["To buy a share on the BRVM, you have to go through…", ["A licensed SGI", "A mobile money agent", "The BCEAO"], "The SGI is the broker licensed by the AMF-UMOA."],
  ["€1 = how many CFA francs? (fixed parity, rounded to the unit)", null, "€1 = 655.957 CFA francs."],
  ["The CFA franc floats freely against the euro.", null, "It's pegged to the euro at a fixed parity."],
  ["Which institution sets the WAEMU's policy rates?", ["The BCEAO", "The BRVM", "The IMF"], "Central Bank of West African States."],
  ["Someone on WhatsApp offers to double your 50,000 CFA francs sent by Orange Money in 7 days. It's…", ["A scam", "A BRVM investment", "A government bond"], "Unrealistic return + payment to an individual = scam."],
  ["The financial markets watchdog of the WAMU is the ___.", ["AMF-UMOA", "AMF France", "SEC"], "Formerly the CREPMF."],
  ["If you buy Bitcoin from Mali, you're also exposed to the dollar exchange rate.", null, "BTC is priced in dollars: the CFA/USD rate adds to the risk."]
] };
T.q.u11 = { t: "Security & going live", sub: "Brokers, scams, crypto", q: [
  ["First criterion for choosing a broker?", ["Its regulation", "Its max leverage", "Its ads"], "Without regulation, your money isn't protected."],
  ["Official support can ask you for your seed phrase.", null, "Never. Anyone who asks for it wants to rob you."],
  ["The safest two-factor authentication uses…", ["An authenticator app", "An SMS", "An email"], "SMS can be hijacked (SIM swap)."],
  ["A platform that asks for no ___ is a red flag.", ["KYC", "tweet", "dividend"], "Regulated firms verify identity."],
  ["How much should you stake on your first real trade?", ["An amount you can lose without consequences", "All your savings", "Your rent money"], "The goal is to test your discipline, not to get rich."],
  ["In a Ponzi scheme, the first gains come from newcomers' deposits.", null, "Until it collapses."],
  ["Before depositing, test…", ["A small withdrawal", "×100 leverage", "A memecoin"], "Being able to withdraw easily is essential."],
  ["What should you build up BEFORE trading?", ["An emergency fund", "A prop firm account", "An NFT collection"], "So you never trade under the pressure of an unexpected event."]
] };
T.q.u12 = { t: "Options & volatility", sub: "Call, put, Greeks, vol, hedging", q: [
  ["A call gives you…", ["The right to buy at a fixed price", "The obligation to buy", "The right to sell"], "Call = right to buy, put = right to sell."],
  ["Maximum loss for an option buyer?", ["The premium", "Unlimited", "The strike"], "They can only lose what they paid."],
  ["Call strike 100, premium 4. At expiry the asset is worth 112. Net gain?", null, "112 − 100 = 12, minus the premium of 4 = 8."],
  ["Theta works against the option buyer.", null, "Every day without a move, the option loses time value."],
  ["The higher implied volatility is, the more an option is…", ["Expensive", "Cheap", "Close to expiry"], "The market expects big moves: the right is worth more."],
  ["After an announcement, implied vol collapses: that's the vol ___.", ["crush", "smile", "spread"], "Options lose value even if the price moves."],
  ["An option seller is…", ["Short gamma", "Long gamma", "Risk-free"], "Big moves make them lose; they collect theta."],
  ["To neutralise its book's direction, a desk does…", ["A delta hedge", "A vol crush", "A breakeven stop"], "It buys or sells the asset to bring its delta back to zero."],
  ["A market maker who wins almost every price request must be very good.", null, "Adverse selection: their prices are probably too low."],
  ["A Malian importer pays in dollars. The main risk is…", ["EUR/USD, because the CFA franc follows the euro", "The gold price", "The BRVM"], "If the euro falls against the dollar, the invoice rises in CFA francs."]
] };

  M.CONTENT_I18N.en = T;
})();
