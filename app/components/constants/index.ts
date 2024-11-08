export const MIN_DEPOSIT_AMOUNT    = 0.002;
export const MIN_WITHDRAWAL_AMOUNT = 0.01;

export const CONTRACT_ABI = [{
      inputs: [{
          internalType: 'bytes32',
          name: '',
          type: 'bytes32'
      }, {
          internalType: 'uint256',
          name: '',
          type: 'uint256'
      }, ],
      name: 'deposit',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
}];
