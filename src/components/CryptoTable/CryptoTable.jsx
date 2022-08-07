import React, { useEffect, useState } from "react";
import { Table } from "antd";
import axios from "axios";
import "./CryptoTable.css";

const CryptoTable = () => {
  const [coinData, setCoinData] = useState([]);
  const [filteredCoinData, setFilteredCoinData] = useState([]);

  const columns = [
    {
      title: "Coin Name",
      key: "name",
      dataIndex: "name",
    },
    { title: "Current Price", key: "price", dataIndex: "currPrice" },
    { title: "% Change", key: "change", dataIndex: "change" },
    { title: "Market capital", key: "capital", dataIndex: "capital" },
  ];

  const getApiData = async () => {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=INR&order=market_cap_desc&per_page=100&page=1&sparkline=false"
    );

    const coinDataArr = data.map((currCoin) => {
      return {
        name: currCoin.name,
        key: currCoin.id,
        currPrice: currCoin.current_price,
        change: currCoin.price_change_percentage_24h,
        capital: currCoin.market_cap,
      };
    });

    setCoinData(coinDataArr);
  };

  const handleChange = (e) => {
    const filteredData = coinData.filter((currentCoin) => {
      return currentCoin.name
        .toLowerCase()
        .includes(e.target.value.toLowerCase());
    });
    setFilteredCoinData(filteredData);
  };

  useEffect(() => {
    getApiData();
  }, []);

  useEffect(() => {
    console.log("hi");
    setFilteredCoinData(coinData);
  }, [coinData]);

  return (
    <div>
      <div className="search">
        <input
          type="search"
          placeholder="Enter the coin name"
          onChange={handleChange}
          className="input"
          autoFocus
        />
      </div>

      <Table columns={columns} dataSource={filteredCoinData} />
    </div>
  );
};

export default CryptoTable;
