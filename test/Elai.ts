import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract, Signer, ContractFactory } from 'ethers';

describe('EmoLiftAI', function () {

  // Variables that will be used across tests
  let EmoLiftAI: ContractFactory;
  let emoLiftAI: Contract;
  let owner: Signer, addr1: Signer, addr2: Signer, addrs: Signer[];

  // This runs before each test, setting up a fresh contract for each test to use
  beforeEach(async () => {
    // Get the contract factory
    EmoLiftAI = await ethers.getContractFactory('EmoLiftAI');

    // Get the signers (accounts that will interact with the contract)
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy the contract
    emoLiftAI = await EmoLiftAI.deploy();
    await emoLiftAI.deployed();
  });

  // Tests the deployment process
  describe('Deployment', function () {
    // Test if the owner is set correctly upon deployment
    it('Should set the right owner', async function () {
      expect(await emoLiftAI.owner()).to.equal(await owner.getAddress());
    });

    // Test if the total supply is minted to the owner upon deployment
    it('Should mint the total supply to owner', async function () {
      const ownerBalance = await emoLiftAI.balanceOf(owner.getAddress());
      const totalSupply = await emoLiftAI.totalSupply();
      expect(ownerBalance.toString()).to.equal(totalSupply.toString());
    });
  });

  // Tests token transactions
  describe('Transactions', function () {
    const amountToTransfer = ethers.utils.parseUnits('50', 'ether'); // 50 tokens

    // Test if tokens can be transferred between accounts
    it('Should transfer tokens between accounts', async function () {
      const initialOwnerBalance = await emoLiftAI.balanceOf(owner.getAddress());

      await emoLiftAI.transfer(addr1.getAddress(), amountToTransfer);
      await emoLiftAI.transfer(addr2.getAddress(), amountToTransfer);

      const finalOwnerBalance = await emoLiftAI.balanceOf(owner.getAddress());
      expect(finalOwnerBalance.add(amountToTransfer.mul(2)).toString()).to.equal(initialOwnerBalance.toString());

      const addr1Balance = await emoLiftAI.balanceOf(addr1.getAddress());
      expect(addr1Balance.toString()).to.equal(amountToTransfer.toString());

      const addr2Balance = await emoLiftAI.balanceOf(addr2.getAddress());
      expect(addr2Balance.toString()).to.equal(amountToTransfer.toString());
    });

    // Test if transactions fail when a sender does not have enough tokens
    it('Should fail if sender doesn’t have enough tokens', async function () {
      const initialOwnerBalance = await emoLiftAI.balanceOf(owner.getAddress());
    
      await expect(
        emoLiftAI.connect(addr1).transfer(owner.getAddress(), amountToTransfer)
      ).to.be.revertedWith('ERC20: transfer amount exceeds balance');
    
      expect((await emoLiftAI.balanceOf(owner.getAddress())).toString()).to.equal(initialOwnerBalance.toString());
    });
    
  });

  // Tests token locking and burning
  describe('Lock and Burn', function () {
    const amountToTransfer = ethers.utils.parseUnits('50', 'ether'); // 50 tokens
    const amountToBurn = ethers.utils.parseUnits('50', 'ether'); // 50 tokens

    // Test if the owner can burn tokens
    it('Should allow owner to burn tokens', async function () {
      const initialBalance = await emoLiftAI.balanceOf(owner.getAddress());
      await emoLiftAI.burn(owner.getAddress(), amountToBurn);
      const finalBalance = await emoLiftAI.balanceOf(owner.getAddress());
      expect(finalBalance.add(amountToBurn).toString()).to.equal(initialBalance.toString());
    });

    // Test if non-owners are prevented from burning tokens
    it('Should prevent non-owners from burning tokens', async function () {
      await expect(emoLiftAI.connect(addr1).burn(addr1.getAddress(), amountToBurn)).to.be.revertedWith('Ownable: caller is not the owner');
    });

    // Test if tokens can be locked and then unlocked
    it('Should lock and unlock tokens', async function () {
      // Transfer some tokens to addr1
      await emoLiftAI.transfer(addr1.getAddress(), amountToTransfer);
    
      // Lock addr1's tokens
      await emoLiftAI.lock(addr1.getAddress(), 5000);
    
      // Verify lock
      const lockedUntil = await emoLiftAI.lockTime(addr1.getAddress());
      expect(lockedUntil.toNumber()).to.be.gt(Math.floor(Date.now() / 1000) + 5000);  // Date.now() is in milliseconds
    
      // Expect the transfer to fail due to locked tokens
      await expect(emoLiftAI.connect(addr1).transfer(addr2.getAddress(), amountToTransfer))
        .to.be.revertedWith('Tokens are locked');
    
      // Increase time and mine next block
      await ethers.provider.send('evm_increaseTime', [6000]); // Increase by 6000 to account for potential round-off
      await ethers.provider.send('evm_mine', []);
    
      // Now the transfer should succeed
      await emoLiftAI.connect(addr1).transfer(addr2.getAddress(), amountToTransfer);
      expect((await emoLiftAI.balanceOf(addr2.getAddress())).toString()).to.equal(amountToTransfer.toString());
    });         
  });
});
