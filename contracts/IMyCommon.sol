// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IMyCommon {
    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;
    function transferFrom(address from, address to, uint value) external returns (bool);
}