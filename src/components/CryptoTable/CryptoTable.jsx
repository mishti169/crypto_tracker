import { Select, Table } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "./CryptoTable.css";

// if value is in Billion format then remove B
// convert String to number
// then do comparison

const convertBillionToNumber = (billionStr) => {
  // billionStr = 43.56B , 327506.32B, 0.28B, 485.27B
  return Number(billionStr.replace("B", ""));
};

const bubbleSort = (arr, type, field) => {
  for (let i = 0; i < arr.length; i++) {
    // Last i elements are already in place
    for (let j = 0; j < arr.length - i - 1; j++) {
      //
      const firstValue = convertBillionToNumber(arr[j][field]);
      const secondValue = convertBillionToNumber(arr[j + 1][field]);

      const condition =
        type === "asc" ? firstValue > secondValue : firstValue < secondValue;
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
        change: Number(currCoin.price_change_percentage_24h.toFixed(2)),
        capital: getB(currCoin.market_cap), //100.2B
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

  const handleDataChange = (value, field) => {
    const newSortedByPriceCoinData = [...filteredCoinData];

    if (value === "LowestFirst") {
      bubbleSort(newSortedByPriceCoinData, "asc", field);
      setFilteredCoinData(newSortedByPriceCoinData);
    } else if (value === "HighestFirst") {
      bubbleSort(newSortedByPriceCoinData, "des", field);
      setFilteredCoinData(newSortedByPriceCoinData);
    } else {
      filterData();
    }
  };
  const getB = (val) => {
    if (val < 1000000) return val;
    const ans = val / 1000000000;
    return ans.toFixed(2) + "B"; //100.2B > 85.6B
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
        <div className="dropdownBar">
          <Select
            defaultValue="CurrentPrice"
            onChange={(value) => handleDataChange(value, "currPrice")}
          >
            <Option value="CurrentPrice">Current Price</Option>
            <Option value="LowestFirst">Lowest First</Option>
            <Option value="HighestFirst">Highest First</Option>
          </Select>
          <Select
            defaultValue="% Change"
            onChange={(value) => handleDataChange(value, "change")}
          >
            <Option value="%Change">% Change</Option>
            <Option value="LowestFirst">Lowest First</Option>
            <Option value="HighestFirst">Highest First</Option>
          </Select>
          <Select
            defaultValue="Market Capital"
            onChange={(value) => handleDataChange(value, "capital")}
          >
            <Option value="MarketCapital">Market Capital</Option>
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
