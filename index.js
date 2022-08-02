import fs from 'fs';

// Install the latest version of starknet with npm install starknet@next and import starknet
import {
  Contract,
  Account,
  defaultProvider,
  ec,
  encode,
  hash,
  json,
  number,
  stark,
  Provider,
} from 'starknet';

import ProxyContract from './ProxyContract.json' assert { type: 'json' };

const ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES = [
  '0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328',
];

const provider = new Provider({ network: 'goerli-alpha' });

console.log('Reading Argent Account Contract...');
const compiledArgentAccount = json.parse(
  fs.readFileSync('./ArgentAccount.json').toString('ascii')
);

const compiledProxyContract = json.parse(
  fs.readFileSync('./ProxyContract.json').toString('ascii')
);

async function getAccountClassHash() {
  // Goerli-testnet account class hash
  // return '0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328';
  // const response = await provider.declareContract({
  // contract: {
  //   abi: ArgentAccount.abi as Abi,
  //   program: ArgentAccount.program,
  //   entry_points_by_type: ArgentAccount.entry_points_by_type,
  // },
  // contract: compiledArgentAccount,
  // });
  // console.log('Account class hash', response);

  // return response.class_hash || ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES[0];
  return ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES[0];
}

async function getDeployContractPayloadForAccount() {
  const starkKeyPair = ec.genKeyPair();
  const starkKeyPub = ec.getStarkKey(starkKeyPair);
  console.log('Getting account class hash');
  const accountClassHash = await getAccountClassHash();
  console.log('Account class hash', accountClassHash);

  const selector = hash.getSelectorFromName('initialize');
  console.log('Selector', selector);

  const payload = {
    contract: {
      abi: ProxyContract.abi,
      program: ProxyContract.program,
      entry_points_by_type: ProxyContract.entry_points_by_type,
    },
    // contract: compiledProxyContract,
    constructorCalldata: stark.compileCalldata({
      implementation: accountClassHash,
      entry_point_selector: selector,
      calldata: stark.compileCalldata({
        signer: starkKeyPub,
        guardian: '0',
      }),
    }),
    addressSalt: starkKeyPub,
  };

  return payload;
}

async function createNewAccount() {
  console.log('Getting payload for deploying contract');
  const payload = await getDeployContractPayloadForAccount();
  console.log(payload);
  console.log('Deploying proxy contract');
  const txResponse = await provider.deployContract(payload);

  console.log(txResponse);
  console.log('Waiting for transaction to be accepted');
  await provider.waitForTransaction(txResponse.transaction_hash);

  if (!txResponse.address) throw 'Cannot create account';

  console.log('Create account successfully');
  const account = {
    address: txResponse.address,
  };

  return { account, txHash: txResponse.transaction_hash };
}

createNewAccount();
