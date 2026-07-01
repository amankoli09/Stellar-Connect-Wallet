import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COINS = [
    { id: 'BTCUSDT', name: 'Bitcoin', symbol: 'BTC', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=025' },
    { id: 'ETHUSDT', name: 'Ethereum', symbol: 'ETH', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025' },
    { id: 'BNBUSDT', name: 'BNB', symbol: 'BNB', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=025' },
    { id: 'SOLUSDT', name: 'Solana', symbol: 'SOL', icon: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=025' },
    { id: 'DOGEUSDT', name: 'Dogecoin', symbol: 'DOGE', icon: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=025' },
    { id: 'XLMUSDT', name: 'Stellar', symbol: 'XLM', icon: 'https://cryptologos.cc/logos/stellar-xlm-logo.svg?v=025' },
    { id: 'ADAUSDT', name: 'Cardano', symbol: 'ADA', icon: 'https://cryptologos.cc/logos/cardano-ada-logo.svg?v=025' },
    { id: 'XRPUSDT', name: 'XRP', symbol: 'XRP', icon: 'https://cryptologos.cc/logos/xrp-xrp-logo.svg?v=025' },
];

export default function MarketAnalytics() {
    const [selectedCoin, setSelectedCoin] = useState(COINS[0]); // Default BTC
    const [data, setData] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [priceChange, setPriceChange] = useState(0);
    const [tickers, setTickers] = useState({});
    
    const wsRef = useRef(null);
    const tickersWsRef = useRef(null);

    // Initial fetch for the chart history
    const fetchHistorical = async (symbol) => {
        try {
            const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`);
            const json = await res.json();
            const formatted = json.map(k => ({
                time: k[0],
                price: parseFloat(k[4]),
                displayTime: new Date(k[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setData(formatted);
            if (formatted.length > 0) {
                const latest = formatted[formatted.length - 1].price;
                const oldest = formatted[0].price;
                setCurrentPrice(latest);
                setPriceChange(((latest - oldest) / oldest) * 100);
            }
        } catch (e) {
            console.error("Failed to fetch historical data", e);
        }
    };

    // WebSocket for the active chart
    useEffect(() => {
        fetchHistorical(selectedCoin.id);

        if (wsRef.current) wsRef.current.close();
        
        const wsUrl = `wss://stream.binance.com:9443/ws/${selectedCoin.id.toLowerCase()}@kline_1m`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.k) {
                const closePrice = parseFloat(msg.k.c);
                const startTime = msg.k.t;
                
                setCurrentPrice(closePrice);
                
                setData(prev => {
                    const newPoint = {
                        time: startTime,
                        price: closePrice,
                        displayTime: new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    
                    const last = prev[prev.length - 1];
                    if (last && last.time === startTime) {
                        const updated = [...prev];
                        updated[updated.length - 1] = newPoint;
                        if (updated.length > 0) {
                            const oldest = updated[0].price;
                            setPriceChange(((closePrice - oldest) / oldest) * 100);
                        }
                        return updated;
                    } else {
                        const updated = [...prev.slice(1), newPoint];
                        if (updated.length > 0) {
                            const oldest = updated[0].price;
                            setPriceChange(((closePrice - oldest) / oldest) * 100);
                        }
                        return updated;
                    }
                });
            }
        };

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [selectedCoin]);

    // WebSocket for the Market Overview Sidebar (All coins)
    useEffect(() => {
        if (tickersWsRef.current) tickersWsRef.current.close();
        
        // Subscribe to @ticker for all coins in the list
        const streams = COINS.map(c => `${c.id.toLowerCase()}@ticker`).join('/');
        const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;
        
        const ws = new WebSocket(wsUrl);
        tickersWsRef.current = ws;

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.data) {
                const s = msg.data.s; // Symbol
                setTickers(prev => ({
                    ...prev,
                    [s]: msg.data
                }));
            }
        };

        // For immediate UI population before websocket updates arrive
        COINS.forEach(async c => {
            try {
                const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${c.id}`);
                const data = await res.json();
                setTickers(prev => {
                    // Only update if websocket hasn't already provided fresher data
                    if (!prev[c.id]) {
                        return { ...prev, [c.id]: { c: data.lastPrice, P: data.priceChangePercent } };
                    }
                    return prev;
                });
            } catch (e) {}
        });

        return () => {
            if (tickersWsRef.current) tickersWsRef.current.close();
        };
    }, []);

    const isPositive = priceChange >= 0;

    return (
        <div className="market-analytics-page">
            <div className="ma-header">
                <div className="ma-eyebrow">[ Real-Time Market ]</div>
                <h2 className="ma-title">Crypto Analytics Dashboard</h2>
                <p className="ma-sub">Live streaming prices and charts from Binance WebSocket.</p>
            </div>

            {/* We keep the coin selector horizontally for mobile/tablet fallback if needed, but primarily use sidebar */}
            <div className="ma-coin-selector">
                {COINS.map(coin => (
                    <button 
                        key={coin.id} 
                        className={`ma-coin-btn ${selectedCoin.id === coin.id ? 'active' : ''}`}
                        onClick={() => setSelectedCoin(coin)}
                    >
                        {coin.name} <span style={{opacity: 0.5}}>{coin.symbol}</span>
                    </button>
                ))}
            </div>

            <div className="ma-dashboard-grid">
                {/* Left: Chart area */}
                <div className="ma-chart-card">
                    <div className="ma-chart-header">
                        <div className="ma-chart-title">
                            <div className="analytics-live-dot" style={{ display: 'inline-flex', position: 'relative', top: '-2px', marginRight: '12px' }}>
                                <span className="analytics-pulse" />
                                <span className="analytics-live-text">LIVE</span>
                            </div>
                            {selectedCoin.name} Price (USD)
                        </div>
                        <div className="ma-chart-price-box">
                            <span className="ma-price">${currentPrice ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: selectedCoin.id === 'BTCUSDT' || selectedCoin.id === 'ETHUSDT' ? 2 : 4 }) : '...'}</span>
                            <span className={`ma-change ${isPositive ? 'positive' : 'negative'}`}>
                                {isPositive ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                    <div className="ma-chart-area">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={isPositive ? "#4ade80" : "#f87171"} stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor={isPositive ? "#4ade80" : "#f87171"} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="displayTime" 
                                        stroke="rgba(255,255,255,0.2)" 
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                                        tickMargin={10}
                                        minTickGap={30}
                                    />
                                    <YAxis 
                                        domain={['auto', 'auto']} 
                                        stroke="rgba(255,255,255,0)" 
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                                        width={80}
                                        tickFormatter={(val) => `$${val}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'rgba(10, 15, 30, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '5px' }}
                                        formatter={(value) => [`$${value}`, 'Price']}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke={isPositive ? "#4ade80" : "#f87171"} 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorPrice)" 
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="ma-loading"><span className="spinner" /> Loading chart data...</div>
                        )}
                    </div>
                </div>

                {/* Right: Market Overview Sidebar */}
                <div className="ma-market-overview">
                    <div className="ma-overview-header">
                        <h3>Market Overview</h3>
                        <span>More &gt;</span>
                    </div>
                    <div className="ma-overview-list">
                        {COINS.map(coin => {
                            const ticker = tickers[coin.id] || {};
                            const price = ticker.c ? parseFloat(ticker.c) : null;
                            const pct = ticker.P ? parseFloat(ticker.P) : 0;
                            const isPos = pct >= 0;
                            
                            return (
                                <div 
                                    key={coin.id} 
                                    className={`ma-overview-item ${selectedCoin.id === coin.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCoin(coin)}
                                >
                                    <div className="ma-oi-left">
                                        <img src={coin.icon} alt={coin.name} className="ma-oi-icon" />
                                        <div className="ma-oi-names">
                                            <div className="ma-oi-symbol">{coin.symbol} <span className="ma-oi-pair">USDT</span></div>
                                            <div className="ma-oi-exchange">Binance</div>
                                        </div>
                                    </div>
                                    <div className="ma-oi-right">
                                        <div className="ma-oi-price">
                                            ${price ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.id === 'BTCUSDT' || coin.id === 'ETHUSDT' ? 2 : 4 }) : '...'}
                                        </div>
                                        <div className={`ma-oi-change ${isPos ? 'positive' : 'negative'}`}>
                                            {isPos ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
