import { Modal, Select, Table } from "antd";
import axios from "axios";
import FusionCharts from "fusioncharts";
import Charts from "fusioncharts/fusioncharts.charts";
import FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";
import React, { Suspense, useEffect, useState } from "react";
import ReactFusioncharts from "react-fusioncharts";
import { format, fromUnixTime, getUnixTime, sub } from "date-fns";

import "./CryptoTable.css";

ReactFusioncharts.fcRoot(FusionCharts, Charts, FusionTheme);
const ReactFC = React.lazy(() => import("react-fusioncharts"));

// if value is in Billion format then remove B
// convert String to number
// then do comparison

const convertBillionToNumber = (billionStr) => {
  // billionStr = 43.56B , 327506.32B, 0.28B, 485.27B
  console.log(billionStr, "str");
  return Number(billionStr.toString().replace("B", ""));
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
const getDateTimeFromTimeStamp = (timeStamp) => {
  const dateObj = fromUnixTime(parseInt(timeStamp / 1000));
  return format(dateObj, "dd/MM/yyyy HH:mm:ss");
};
const getFromTimeStamp = (timeRange) => {
  if (timeRange === "7D") {
    const ans = sub(new Date(), { weeks: 1 });
    return getUnixTime(ans);
  } else if (timeRange === "1M") {
    const ans = sub(new Date(), { months: 1 });
    return getUnixTime(ans);
  } else if (timeRange === "3M") {
    const ans = sub(new Date(), { months: 3 });
    return getUnixTime(ans);
  } else if (timeRange === "1Y") {
    const ans = sub(new Date(), { years: 1 });
    return getUnixTime(ans);
  } else if (timeRange === "3Y") {
    const ans = sub(new Date(), { years: 3 });
    return getUnixTime(ans);
  } else {
    const ans = sub(new Date(), { days: 1 });
    return getUnixTime(ans);
  }
};

const CryptoTable = () => {
  const [coinData, setCoinData] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [filteredCoinData, setFilteredCoinData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState({});
  const { Option } = Select;
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState("");

  const dataSource = {
    chart: {
      caption: "Price changes",
      yaxisname: "price",
      xaxisname: "time",
      subcaption: "",
      rotatelabels: "1",
      setadaptiveymin: "1",
      theme: "fusion",
    },
    data: chartData,
  };

  const chartConfigs = {
    type: "line",
    width: "100%",
    height: "100%",
    dataFormat: "json",
    dataSource,
  };
  const showModal = (currentCoin) => {
    setIsVisible(true);
    setSelectedCoin(currentCoin);
  };
  const columns = [
    {
      title: () => <b style={{ fontSize: "18px" }}>Coin Name</b>,
      key: "name",
      dataIndex: "name",
      render: (_, currCoin) => {
        const { name, image } = currCoin;

        return (
          <div>
            <div>
              <img src={image} alt="" width={32} />
              <span style={{ marginLeft: "10px" }}>{name}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: () => <b style={{ fontSize: "16px" }}>Current Price</b>,
      key: "price",
      dataIndex: "currPrice",
      align: "right",
      width: "150px",
    },
    {
      title: () => <b style={{ fontSize: "16px" }}>% Change</b>,
      key: "change",
      dataIndex: "change",
      align: "right",
      width: "150px",
      render: (percentage) => {
        const color = percentage > 0 ? "green" : "red";
        return (
          <>
            <span style={{ color: color }}>{percentage}</span>
          </>
        );
      },
    },
    {
      title: () => <b style={{ fontSize: "16px" }}>Market capital</b>,
      key: "capital",
      dataIndex: "capital",
      align: "right",
      width: "180px",
    },
  ];
  const handleCancel = () => {
    setIsVisible(false);
  };

  const getApiData = async () => {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=INR&order=market_cap_desc&per_page=100&page=1&sparkline=false"
    );

    const coinDataArr = data.map((currCoin) => {
      return {
        name: currCoin.name,
        image: currCoin.image,
        key: currCoin.id,
        currPrice: currCoin.current_price,
        change: Number(currCoin.price_change_percentage_24h.toFixed(2)),
        capital: getB(currCoin.market_cap),
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

  const getChartApiData = async (id) => {
    const toTimeSTamp = getUnixTime(new Date());
    const fromTimeStamp = getFromTimeStamp(timeRange);
    console.log(toTimeSTamp);

    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart/range?vs_currency=inr&from=${fromTimeStamp}&to=${toTimeSTamp}`
    );
    const { prices } = data;
    const convertedData = prices.map((currItem) => {
      const [timeStamp, price] = currItem;
      const dateTime = getDateTimeFromTimeStamp(timeStamp);
      return { label: dateTime, value: price };
    });
    setChartData(convertedData);
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
  useEffect(() => {
    if (timeRange) {
      // api
      getChartApiData(selectedCoin.key);
    }
  }, [timeRange]);

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

      <Table
        onRow={(record) => {
          return {
            onClick: () => {
              showModal(record);
              getChartApiData(record.key);
            },
          };
        }}
        columns={columns}
        dataSource={filteredCoinData}
        className="table"
      />
      <Modal
        title="Mishti Modal"
        visible={isVisible}
        onCancel={handleCancel}
        width="900px"
      >
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <img src={selectedCoin.image} alt={selectedCoin.name} width="140px" />
          <div>
            <h2>{selectedCoin.name}</h2>
            <h3>Current-Price: {selectedCoin.currPrice}</h3>
            <h3>Market Capital: {selectedCoin.capital}</h3>
          </div>
        </div>
        <div>
          <Select defaultValue="1D" onChange={(value) => setTimeRange(value)}>
            <Option value="1D">1D</Option>
            <Option value="7D">7D</Option>
            <Option value="1M">1M</Option>
            <Option value="3M">3M</Option>
            <Option value="6M">6M</Option>
            <Option value="1Y">1Y</Option>
          </Select>
          <Suspense fallback={<div>Loading...</div>}>
            <div style={{ margin: "10px 0" }}>
              <ReactFC {...chartConfigs} />
            </div>
          </Suspense>
        </div>
      </Modal>
    </div>
  );
};

export default CryptoTable;
