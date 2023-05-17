import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";

describe("EmoLiftAI Contract", function () {
    let EmoLiftAI: ContractFactory;
    let elai: Contract;

  beforeEach(async () => {
    EmoLiftAI = await ethers.getContractFactory("EmoLiftAI");
    elai = await EmoLiftAI.deploy();
    await elai.deployed();
  });

  it("should have correct name, symbol, and initial supply", async function () {
    const name = await elai.name();
    const symbol = await elai.symbol();
    const totalSupply = await elai.totalSupply();

    expect(name).to.equal("EmoLiftAI");
    expect(symbol).to.equal("ELAI");
    expect(totalSupply).to.equal(ethers.utils.parseEther("1000000000"));
  });

  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();

    const EmoLiftAIFactory = await ethers.getContractFactory("EmoLiftAI");
    const elai = await EmoLiftAIFactory.deploy();
    await elai.deployed();

    const ownerBalance = await elai.balanceOf(owner.address);
    const totalSupply = await elai.totalSupply();

    expect(ownerBalance).to.equal(totalSupply);
  });

  it("should transfer tokens correctly", async function () {
    const [sender, recipient] = await ethers.getSigners();

    await elai.transfer(recipient.address, ethers.utils.parseEther("1000"));

    const senderBalance = await elai.balanceOf(sender.address);
    const recipientBalance = await elai.balanceOf(recipient.address);

    expect(senderBalance).to.equal(ethers.utils.parseEther("999999000"));
    expect(recipientBalance).to.equal(ethers.utils.parseEther("1000"));
  });

  // Add more test cases as needed

});
