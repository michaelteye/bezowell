 
let  TRANSFER_STATUS_MESSAGE = {
     "00" : "Transaction successful",
     "03" : "Sender has insufficient funds",
     "11" : "Withdrawal not allowed on sender account",
     "12" : "Recipient account does not allow deposit",
     "13" : "Deposit limit exceeded on recipient account",
     "14" : "Withdrawal limit exceeded on sender account",
    };
export default TRANSFER_STATUS_MESSAGE;