import { rpc, TransactionBuilder, Networks, Address, Operation, xdr, scValToNative, nativeToScVal } from '@stellar/stellar-sdk';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit/sdk';

const rpcUrl = 'https://soroban-testnet.stellar.org';
export const server = new rpc.Server(rpcUrl);
export const networkPassphrase = Networks.TESTNET;

// Replace this with the actual deployed contract ID later
export const CONTRACT_ID = 'CAKVP6WJITLBTZOCGL4JEEKYWPYDT7EXREE6EM27WJV6Y7WTWNVCCYXS'; 

export async function fetchContractState() {
  if (CONTRACT_ID === 'TO_BE_REPLACED') {
      return { goal: 0, raised: 0 };
  }
  
  try {
    const goalRes = await server.simulateTransaction(
      new TransactionBuilder(
        await server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'),
        { fee: '100', networkPassphrase }
      )
        .addOperation(
          Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeInvokeContract(
              new xdr.InvokeContractArgs({
                contractAddress: Address.fromString(CONTRACT_ID).toScAddress(),
                functionName: 'get_goal',
                args: [],
              })
            ),
            auth: [],
          })
        )
        .setTimeout(30)
        .build()
    );

    const raisedRes = await server.simulateTransaction(
      new TransactionBuilder(
        await server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'),
        { fee: '100', networkPassphrase }
      )
        .addOperation(
          Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeInvokeContract(
              new xdr.InvokeContractArgs({
                contractAddress: Address.fromString(CONTRACT_ID).toScAddress(),
                functionName: 'get_total_raised',
                args: [],
              })
            ),
            auth: [],
          })
        )
        .setTimeout(30)
        .build()
    );

    const goal = goalRes.result?.retval ? scValToNative(goalRes.result.retval) : 0;
    const raised = raisedRes.result?.retval ? scValToNative(raisedRes.result.retval) : 0;
    
    return {
      goal: Number(goal),
      raised: Number(raised)
    };
  } catch (error) {
    console.error("Error fetching contract state:", error);
    return { goal: 0, raised: 0 };
  }
}

export async function submitDonation(pubKey, amount) {
  try {
    const account = await server.getAccount(pubKey);
    let tx = new TransactionBuilder(account, { fee: '1000', networkPassphrase })
      .addOperation(
        Operation.invokeHostFunction({
          func: xdr.HostFunction.hostFunctionTypeInvokeContract(
            new xdr.InvokeContractArgs({
              contractAddress: Address.fromString(CONTRACT_ID).toScAddress(),
              functionName: 'donate',
              args: [
                nativeToScVal(pubKey, { type: 'address' }),
                nativeToScVal(amount, { type: 'i128' }),
              ],
            })
          ),
          auth: [],
        })
      )
      .setTimeout(30)
      .build();

    const preparedTx = await server.prepareTransaction(tx);
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(preparedTx.toXDR(), {
      networkPassphrase,
      address: pubKey,
    });

    const signedTx = TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase);
    
    const submitResponse = await server.sendTransaction(signedTx);
    if (submitResponse.status === "ERROR") {
      throw new Error(`Transaction failed: ${JSON.stringify(submitResponse)}`);
    }

    return submitResponse;
  } catch (error) {
    console.error("Error submitting donation:", error);
    throw error;
  }
}

export async function checkTransactionStatus(txHash) {
  while (true) {
    const status = await server.getTransaction(txHash);
    if (status.status !== rpc.Api.GetTransactionStatus.NOT_FOUND) {
      return status;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
