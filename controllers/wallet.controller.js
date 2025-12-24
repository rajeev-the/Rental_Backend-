import Wallet from "../model/wallet.js";


const ensurewalletexists = async(userId)=>{
    const wallet = await wallet.finfOne({userId});
    if(!wallet){
        await Wallet.create({
            userId:userId,
            balance:0
        })
    }
    return wallet;
}


/**
 * GET /api/v1/wallet
 */


export const getMyWallet = async(req,res)=>{
    const wallet = await ensurewalletexists(req.user.userId);

    res.json({
        success:true,
        wallet:{
            balance:wallet.balance,
            lockedAmount:wallet.lockedAmount,
        }
    })
}

/**
 * POST /api/v1/wallet/add
 */

export const addMoneyToWallet = async(req,res)=>{
    const {amount} = req.body;

    if(!amount || amount <=0){
        return res.status(400).json({message:"Invalid amount"});
    }

      const wallet = await ensureWallet(req.user.userId);
      wallet.balance += amount;
      
      wallet.transactions.push({
        type:"deposit",
        amount:amount,
        balanceAfter:wallet.balance,
        description:"Funds added to wallet"
      });
        await wallet.save();

         res.status(200).json({
    success: true,
    message: "Money added successfully",
    balance: wallet.balance,
  });

   
}


/**
 * POST /api/v1/wallet/withdraw
 */
export const withdrawMoneyFromWallet = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid amount is required",
    });

  }

  const wallet = await ensureWallet(req.user.id);

  if (wallet.balance < amount) {
    return res.status(400).json({
      success: false,
      message: "Insufficient wallet balance",
    });
  }

  wallet.balance -= amount;

  wallet.transactions.push({
    type: "withdraw",
    amount,
    balanceAfter: wallet.balance,
    description: "Money withdrawn from wallet",
  });

  await wallet.save();

  res.status(200).json({
    success: true,
    message: "Money withdrawn successfully",
    balance: wallet.balance,
  });
};



/**
 * GET /api/v1/wallet/transactions
 */
export const getWalletTransactions = async (req, res) => {
  const wallet = await ensureWallet(req.user.id);

  res.status(200).json({
    success: true,
    count: wallet.transactions.length,
    transactions: wallet.transactions.sort(
      (a, b) => b.createdAt - a.createdAt
    ),
  });
};


