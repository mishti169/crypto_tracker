import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { Select } from "antd";
import axios from "axios";
import "./CryptoTable.css";

const bubbleSort = (arr, type) => {
  for (let i = 0; i < arr.length; i++) {
    // Last i elements are already in place
    for (let j = 0; j < arr.length - i - 1; j++) {
      const condition =
        type === "asc"
          ? arr[j].currPrice > arr[j + 1].currPrice
          : arr[j].currPrice < arr[j + 1].currPrice;
      // Checking if the item at present iteration
      // is greater than the next iteration
      if (condition) {
        // If the condition is true then swap them
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
};

const CryptoTable = () => {
  const [coinData, setCoinData] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [filteredCoinData, setFilteredCoinData] = useState([]);
  const { Option } = Select;
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

  const filterData = () => {
    const filteredData = coinData.filter((currentCoin) => {
      return currentCoin.name.toLowerCase().includes(inputVal.toLowerCase());
    });
    setFilteredCoinData(filteredData);
  };

  const handleChange = (e) => {
    setInputVal(e.target.value);
  };

  const handlePriceChange = (value) => {
    const newFilteredCoinData = [...filteredCoinData];

    if (value === "LowestFirst") {
      bubbleSort(newFilteredCoinData, "asc");
      setFilteredCoinData(newFilteredCoinData);
    } else if (value === "HighestFirst") {
      bubbleSort(newFilteredCoinData, "des");
      setFilteredCoinData(newFilteredCoinData);
    } else {
      filterData();
    }
  };

  useEffect(() => {
    getApiData();
  }, []);

  useEffect(() => {
    setFilteredCoinData(coinData);
  }, [coinData]);

  useEffect(() => {
    filterData();
  }, [inputVal]);

  return (
    <div>
      <div className="search">
        <input
          type="search"
          placeholder="Enter the coin name"
          onChange={handleChange}
          value={inputVal}
          className="input"
          autoFocus
        />
        <div>
          <Select defaultValue="CurrentPrice" onChange={handlePriceChange}>
            <Option value="CurrentPrice">Current Price</Option>
            <Option value="LowestFirst">Lowest First</Option>
            <Option value="HighestFirst">Highest First</Option>
          </Select>
          <Select defaultValue="Market Capital">
            <Option value="MarketCapital">Market Capital</Option>
            <Option value="LowestFirst">Lowest First</Option>
            <Option value="HighestFirst">Highest First</Option>
          </Select>
          <Select defaultValue="% Change">
            <Option value="%Change">% Change</Option>
            <Option value="LowestFirst">Lowest First</Option>
            <Option value="HighestFirst">Highest First</Option>
          </Select>
        </div>
      </div>

      <Table columns={columns} dataSource={filteredCoinData} />
    </div>
  );
};

export default CryptoTable;
