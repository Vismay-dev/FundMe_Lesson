// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConvertor {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint)
    {
        // ABI
        // Address 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e

        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint(price * 1e10);
    }

    function getConversionRate(uint256 ethAmnt, AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint)
    {
        uint ethPrice = getPrice(priceFeed);
        return ((ethAmnt * ethPrice) / 1e18);
    }
}
