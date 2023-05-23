// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EmoLiftAI is ERC20, Ownable {

    // lockTime stores the timestamp until which an account's tokens are locked
    // locked tokens cannot be transferred
    mapping(address => uint256) public lockTime;

    // constructor mints 1 billion tokens and assigns them to the owner of the contract
    constructor() ERC20("EmoLiftAI", "ELAI") {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }

    // The lock function locks the tokens of a specified account for a specified amount of time
    // Only the owner of the contract can lock tokens
    function lock(address account, uint256 time) public onlyOwner {
        // the lock time is the current time plus the specified amount of time
        lockTime[account] = block.timestamp + time;
    }

    // The burn function burns a specified amount of tokens from a specified account
    // Only the owner of the contract can burn tokens
    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }

    // The transfer function transfers a specified amount of tokens to a specified account
    // The transfer will fail if the tokens are locked
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        // require that the current time is greater than the lock time
        require(block.timestamp > lockTime[msg.sender], "Tokens are locked");

        // call the transfer function of the ERC20 contract
        return super.transfer(recipient, amount);
    }

    // The transferFrom function transfers a specified amount of tokens from one account to another
    // The transfer will fail if the tokens are locked
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        // require that the current time is greater than the lock time
        require(block.timestamp > lockTime[sender], "Tokens are locked");

        // call the transferFrom function of the ERC20 contract
        return super.transferFrom(sender, recipient, amount);
    }
    
}
