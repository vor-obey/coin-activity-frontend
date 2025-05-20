import { useEffect, useRef, useState } from "react";

import "./App.css";
import { CandleTimer } from "./CandleTimer.tsx";

const apiUrl = import.meta.env.VITE_API_URL;

const CHANGE_0_5_PERCENT = 0.5; //#198500
const CHANGE_1_5_PERCENT = 1.5; //#17ce00
const CHANGE_2_PERCENT = 2; //#bb00fa
const CHANGE_3_AND_MORE_PERCENT = 3; //#ff1414;

function formatNumber(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
  return value.toFixed(2);
}

interface CoinData {
  symbol: string;
  open: number;
  close: number;
  change: number;
  isHot: boolean;
  direction: "up" | "down";
  volume24h: number;
}

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [coins, setCoins] = useState<any>();
  const [showNavbar, setShowNavbar] = useState(false);
  const [timeframe, setTimeframe] = useState<
    "1m" | "3m" | "5m" | "15m" | "30m" | "1h"
  >("1m");
  const socketRef = useRef<WebSocket | null>(null);
  const [query, setQuery] = useState<any>("");
  const timeoutRef = useRef<any>(null);

  const handleCheckboxChange = (e: any, frame: any) =>
    setTimeframe(e.target.checked ? frame : "1m");

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 60 * 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const socket = new WebSocket(apiUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      socket.send(JSON.stringify({ action: "setTimeframe", timeframe }));
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const data: CoinData[] = JSON.parse(event.data);
      setCoins((prevCoins: any) => {
        const updatedCoins = { ...prevCoins };
        data.forEach((coin) => {
          updatedCoins[coin.symbol] = coin;
        });
        return updatedCoins;
      });
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, [timeframe]);

  useEffect(() => {
    const handleMouseMove = (e: any) => {
      if (e.clientY <= 50) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setQuery((prev: any) => prev + e.key);
      }

      if (e.key === "Backspace") {
        setQuery((prev: any) => prev.slice(0, -1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (query) {
      timeoutRef.current = setTimeout(() => {
        setQuery("");
      }, 10000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query]);

  // const coinEntries = coins
  //   ? Object.entries(coins).reduce<
  //       [typeof Object.entries, typeof Object.entries]
  //     >(
  //       (acc, entry) => {
  //         const [, coin] = entry;
  //         if (coin.change > 0.5) {
  //           acc[0].push(entry); // Вверх
  //         } else {
  //           acc[1].push(entry); // Вниз
  //         }
  //         return acc;
  //       },
  //       [[], []],
  //     )
  //   : [[], []];
  //
  // const entriesSortedByChange = [...coinEntries[0], ...coinEntries[1]];
  const entriesSortedByChange = coins && Object.entries(coins);

  function extractNumber(str: string): number {
    if (!str) return 1;

    if (str === "1h") return 60;

    const match: any = str.match(/\d+/);
    return parseInt(match[0], 10);
  }

  return (
    <div className="root custom-scrollbar">
      <div
        className="navbar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "50px",
          backgroundColor: `rgba(70, 70, 70, ${Math.min(0.9, 1)})`,
          borderBottom: "1px solid #757575",
          boxShadow: "0px 16px 13px -7px rgba(34, 60, 80, 0.5)",
          color: "white",
          display: showNavbar ? "flex" : "none",
          padding: "0 20px",
          zIndex: 1000,
          transition: "opacity 0.3s ease",
        }}
      >
        <label>
          <input
            type="checkbox"
            checked={timeframe === "1m"}
            onChange={(e) => handleCheckboxChange(e, "1m")}
            value="checked"
          />
          Show 1 min timeframe
        </label>
        <label>
          <input
            type="checkbox"
            checked={timeframe === "3m"}
            onChange={(e) => handleCheckboxChange(e, "3m")}
            value="checked"
          />
          Show 3 min timeframe
        </label>
        <label>
          <input
            type="checkbox"
            checked={timeframe === "5m"}
            onChange={(e) => handleCheckboxChange(e, "5m")}
            value="checked"
          />
          Show 5 min timeframe
        </label>
        <label>
          <input
            type="checkbox"
            checked={timeframe === "15m"}
            onChange={(e) => handleCheckboxChange(e, "15m")}
            value="checked"
          />
          Show 15 min timeframe
        </label>
        <label>
          <input
            type="checkbox"
            checked={timeframe === "30m"}
            onChange={(e) => handleCheckboxChange(e, "30m")}
            value="checked"
          />
          Show 30 min timeframe
        </label>
        <label>
          <input
            type="checkbox"
            checked={timeframe === "1h"}
            onChange={(e) => handleCheckboxChange(e, "1h")}
            value="checked"
          />
          Show 1h timeframe
        </label>
        <div
          className={`${isConnected ? "status-active" : "status-disconnect"}`}
        ></div>
      </div>

      <div className="cell-container">
        {entriesSortedByChange?.map(([symbol, coin]: any, i: number) => {
          const isMatch =
            query && symbol.toLowerCase().includes(query.toLowerCase());
          return (
            <a
              key={symbol}
              className={`h-16 flex items-center justify-center text-xs font-bold text-white cell ${
                i === entriesSortedByChange.length - 1 ? "lastCell" : ""
              } ${isMatch ? "matched" : ""} `}
              style={{
                background:
                  Math.abs(coin.change) >= CHANGE_3_AND_MORE_PERCENT
                    ? "#ff1414"
                    : Math.abs(coin.change) >= CHANGE_2_PERCENT
                      ? "#bb00fa"
                      : Math.abs(coin.change) >= CHANGE_1_5_PERCENT
                        ? "#17ce00"
                        : Math.abs(coin.change) >= CHANGE_0_5_PERCENT
                          ? "#198500"
                          : "",
              }}
              href={`https://digash.live/#/app/coins-view/BINANCE_FUTURES/${symbol}`}
              target="_blank"
            >
              <div className="cell-info-head">
                <span className="symbol">{symbol}</span>
                <span className={coin?.isHot ? "hot" : ""}>
                  {coin?.change}%
                </span>
              </div>
              <div className="cell-info">
                <span>O: {coin.open}</span>
                <span className={coin.direction === "up" ? "p-high" : "p-low"}>
                  C: {coin.close}
                </span>
                <span
                  className={
                    coin.volume24h <= 10_000_000
                      ? "volume-low"
                      : coin.volume24h <= 50_000_000
                        ? "volume-medium"
                        : coin.volume24h <= 100_000_000
                          ? "large-volume"
                          : "max-volume"
                  }
                >
                  {formatNumber(coin.volume24h)}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <CandleTimer intervalMinutes={extractNumber(timeframe)} />
    </div>
  );
}

export default App;
