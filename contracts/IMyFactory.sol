// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IMyFactory {
    function INIT_CODE_PAIR_HASH() external view returns (bytes32);
    function feeTo() external view returns (address);
    function feeTo2() external view returns (address);
    function feeTo3() external view returns (address);
    function feeToSetter() external view returns (address);

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint) external view returns (address pair);
    function allPairsLength() external view returns (uint);

    function createPair(address tokenA, address tokenB) external returns (address pair);

    function setFeeTo(address, address, address) external;
    function setFeeToSetter(address) external;
}