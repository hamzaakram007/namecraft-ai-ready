import axios from 'axios';
import { getRow, runQuery } from './database.js';

const USDT_CONTRACT_ADDRESS = (process.env.USDT_CONTRACT_ADDRESS || '0x55d398326f99059ff775485246999027b3197955').toLowerCase();
const EXPLORER_API_KEY = process.env.BSCSCAN_API_KEY || process.env.ETHERSCAN_API_KEY;
const TRANSFER_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

function formatAddressTopic(address) {
  return '0x' + address.toLowerCase().replace(/^0x/, '').padStart(64, '0');
}

// Verify USDT payment on Binance Smart Chain (BSC)
export async function verifyUSDTPayment(txHash) {
  try {
    const walletAddress = process.env.USDT_WALLET_ADDRESS;
    if (!walletAddress) {
      throw new Error('USDT wallet address is not configured');
    }
    if (!EXPLORER_API_KEY) {
      throw new Error('BscScan API key is not configured');
    }

    const bscUrl = `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${EXPLORER_API_KEY}`;
    const response = await axios.get(bscUrl);
    const result = response.data.result;

    if (!result || result.status !== '0x1') {
      return { success: false, status: 'failed', error: 'Transaction not confirmed' };
    }

    const walletTopic = formatAddressTopic(walletAddress);
    const matchingTransfer = (result.logs || []).some(log => {
      return (
        log.address?.toLowerCase() === USDT_CONTRACT_ADDRESS &&
        log.topics?.[0] === TRANSFER_EVENT_TOPIC &&
        log.topics?.[2]?.toLowerCase() === walletTopic
      );
    });

    if (!matchingTransfer) {
      return { success: false, status: 'failed', error: 'No USDT transfer to the configured wallet found in this transaction' };
    }

    return {
      success: true,
      txHash,
      status: 'confirmed',
      blockNumber: result.blockNumber
    };
  } catch (err) {
    console.error('Payment verification error:', err);
    return { success: false, error: err.message };
  }
}

// Record payment
export async function recordPayment(userId, paymentMethod, amount, txHash, paymentType) {
  try {
    const result = await runQuery(
      `INSERT INTO payments (userId, paymentMethod, amount, transactionHash, status, paymentType) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, paymentMethod, amount, txHash, 'pending', paymentType]
    );

    return result;
  } catch (err) {
    throw err;
  }
}

// Confirm payment and upgrade to premium
export async function confirmPaymentAndUpgradePremium(userId, paymentId, txHash) {
  try {
    // Verify payment on blockchain
    const verification = await verifyUSDTPayment(txHash);
    
    if (verification.success) {
      // Update payment status
      await runQuery(
        'UPDATE payments SET status = ?, confirmedAt = ? WHERE id = ?',
        ['confirmed', new Date().toISOString(), paymentId]
      );

      // Calculate premium expiry (1 year from now)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      // Upgrade user to premium
      await runQuery(
        'UPDATE users SET isPremium = 1, premiumExpiresAt = ? WHERE id = ?',
        [expiryDate.toISOString(), userId]
      );

      return { success: true, message: 'Premium activated!' };
    } else {
      throw new Error('Payment verification failed');
    }
  } catch (err) {
    console.error('Premium upgrade error:', err);
    throw err;
  }
}

// Check payment status
export async function checkPaymentStatus(txHash) {
  try {
    const payment = await getRow('SELECT * FROM payments WHERE transactionHash = ?', [txHash]);
    if (!payment) {
      throw new Error('Payment not found');
    }
    return payment;
  } catch (err) {
    throw err;
  }
}
