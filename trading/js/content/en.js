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

  M.CONTENT_I18N.en = T;
})();
