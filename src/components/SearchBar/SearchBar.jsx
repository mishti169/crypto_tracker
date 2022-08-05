import React, { useState } from "react";
import "./SearchBar.css";
const SearchBar = () => {
  const [inputVal, setInputVal] = useState("");

  const handleChange = (e) => {
    setInputVal(e.target.value);
  };

  return (
    <>
      <form className="search">
        <input
          type="search"
          placeholder="Enter the coin name"
          onChange={handleChange}
          value={inputVal}
          className="input"
        />
      </form>
    </>
  );
};

export default SearchBar;
