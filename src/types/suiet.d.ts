interface SuiWallet {
  signAndExecuteTransactionBlock(params: {
    transactionBlock: {
      kind: string;
      target: string;
      arguments: any[];
    };
  }): Promise<any>;
  // Add other methods as needed
}

declare global {
  interface Window {
    suiWallet: SuiWallet;
  }
}

export {};
