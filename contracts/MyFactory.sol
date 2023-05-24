// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IMyFactory.sol";
import "./MyPair.sol";

contract MyFactory is IMyFactory {
    bytes32 public constant INIT_CODE_PAIR_HASH = keccak256(abi.encodePacked(type(MyPair).creationCode));

    address public feeTo;
    address public feeTo2;
    address public feeTo3;
    address public feeToSetter;

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
	
    constructor(address _feeToSetter) {
        feeToSetter = _feeToSetter;
        feeTo = _feeToSetter;
        feeTo2 = _feeToSetter;
        feeTo3 = _feeToSetter;
    }

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function setFeeTo(address _feeTo, address _feeTo2, address _feeTo3) external {
        require(msg.sender == feeToSetter, 'FORBIDDEN');

        feeTo = _feeTo;
        feeTo2 = _feeTo2;
        feeTo3 = _feeTo3;
    }

    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, 'FORBIDDEN');
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, 'IDENTICAL_ADDRESSES');

        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'ZERO_ADDRESS');
        require(getPair[token0][token1] == address(0), 'PAIR_EXISTS');

        bytes memory bytecode = type(MyPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        IMyPair(pair).initialize(token0, token1);

        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);

        emit PairCreated(token0, token1, pair, allPairs.length);
    }
}