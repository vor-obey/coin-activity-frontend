import { useEffect, useRef, useState } from "react";

import "./App.css";
import { CandleTimer } from "./CandleTimer.tsx";

const apiUrl = import.meta.env.VITE_API_URL;

function formatNumber(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
  return value.toFixed(2);
}

const CHANGE_0_5_PERCENT = 0.5; //#198500
const CHANGE_1_5_PERCENT = 1.5; //#17ce00
const CHANGE_2_PERCENT = 2; //#bb00fa
const CHANGE_3_AND_MORE_PERCENT = 3; //#ff1414;

interface CoinData {
  symbol: string;
  open: number;
  close: number;
  change: number;
  isHot: boolean;
  direction: "up" | "down";
}

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [coins, setCoins] = useState<any>();
  const checkboxRef = useRef<any>(null);
  // const [isSorted, setIsSorted] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  const [timeframe, setTimeframe] = useState<"1m" | "3m" | "5m" | "15m">("1m");
  const socketRef = useRef<WebSocket | null>(null);
  const handleCheckboxChange = (e, frame) =>
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
      setCoins((prevCoins) => {
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

  const coinEntries = coins
    ? Object.entries(coins).reduce<
        [typeof Object.entries, typeof Object.entries]
      >(
        (acc, entry) => {
          const [, coin] = entry;
          if (coin.change > 0.5) {
            acc[0].push(entry); // Вверх
          } else {
            acc[1].push(entry); // Вниз
          }
          return acc;
        },
        [[], []],
      )
    : [[], []];

  const entriesSortedByChange = [...coinEntries[0], ...coinEntries[1]];

  function extractNumber(str: string): number {
    const match = str.match(/\d+/);
    return parseInt(match[0], 10);
  }

  return (
    <div className="root">
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
        <div
          className={`${isConnected ? "status-active" : "status-disconnect"}`}
        ></div>
      </div>

      <div className="cell-container">
        {entriesSortedByChange?.map(([symbol, coin], i) => (
          <div
            key={symbol}
            className={`h-16 flex items-center justify-center text-xs font-bold text-white cell ${
              i === coinEntries.length - 1 ? "lastCell" : ""
            } `}
            style={{
              background:
                coin.change >= CHANGE_3_AND_MORE_PERCENT
                  ? "#ff1414"
                  : coin.change >= CHANGE_2_PERCENT
                    ? "#bb00fa"
                    : coin.change >= CHANGE_1_5_PERCENT
                      ? "#17ce00"
                      : coin.change >= CHANGE_0_5_PERCENT
                        ? "#198500"
                        : "",
            }}
            onClick={() =>
              window.open(
                `https://digash.live/#/app/coins-view/BINANCE_FUTURES/${symbol}`,
                "_blank",
              )
            }
          >
            <div className="cell-info-head">
              <span className="symbol">{symbol}</span>
              <span className={coin?.isHot ? "hot" : ""}>{coin?.change}%</span>
            </div>
            <div className="cell-info">
              <span>O: {coin.open}</span>
              <span className={coin.direction === "up" ? "p-high" : "p-low"}>
                C: {coin.close}
              </span>
            </div>
          </div>
        ))}
      </div>

      <CandleTimer intervalMinutes={extractNumber(timeframe)} />
    </div>
  );
}

export default App;
