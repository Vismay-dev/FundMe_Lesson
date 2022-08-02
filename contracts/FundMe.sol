// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "./PriceConvertor.sol";
import "hardhat/console.sol";

error FundMe__notOwner();
error FundMe__insufficient();
error FundMe__failedCall();

contract FundMe {
    using PriceConvertor for uint256;

    uint public constant MINIMUMUSD = 50 * 1e18; // Wei no. of units = 1e18
    address[] private s_funders;
    address private immutable i_owner;

    AggregatorV3Interface private s_priceFeed;

    mapping(address => uint256) private s_addressToAmountFunded;

    function getFunders(uint index) public view returns (address) {
        return s_funders[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint)
    {
        return s_addressToAmountFunded[funder];
    }

    constructor(address priceFeedAddress) {
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_owner = msg.sender;
    }

    function fund() public payable {
        //set minimum fund amount in USD
        if ((msg.value).getConversionRate(s_priceFeed) < MINIMUMUSD) {
            revert FundMe__insufficient();
        }

        //store funder data
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value; // in Wei
    }

    function withdraw() public onlyOwner {
        address[] memory funders = s_funders;
        // set all fund amounts to 0
        for (uint256 index = 0; index < funders.length; index++) {
            address funder = funders[index];
            s_addressToAmountFunded[funder] = 0;
        }

        // reset s_funders array
        s_funders = new address[](0);

        // transfer funds to i_owner
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!callSuccess) {
            revert FundMe__failedCall();
        }
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__notOwner();
        }

        _;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
