// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ERC20.sol";

contract TokenB is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        // By default, 1 billion tokens will be minted.
        _mint(msg.sender, 100000000 * (10**18));
    }
}