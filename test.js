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
} from 'starknet';
import ArgentAccount from './ArgentAccount.json' assert { type: 'json' };

import { transformCallsToMulticallArrays } from './node_modules/starknet/utils/transaction.js';

// const compiledArgentAccount = json.parse(JSON.stringify(ArgentAccount));

// fs.writeFileSync('./account.txt', JSON.parse(ArgentAccount));
console.log(ArgentAccount);
