// import * as Ipfs from 'ipfs';
const { v4: uuidv4 } = require('uuid');
import { Subject } from "rxjs";
import { BeeConfig } from "./beeConfig.js";
import { HoneyComb } from "./honeyComb.js";


// import { Ocean }  from '@questnetwork/quest-ocean-js';

export class BeeSwarm {
    constructor() {
      let uVar;
      this.config = new BeeConfig();
      this.comb = new HoneyComb(this.config);
    }

    async start(config){
      await this.config.start(config);
    }

    delay(t, val = "") {
       return new Promise(function(resolve) {
           setTimeout(function() {
               resolve(val);
           }, t);
       });
    }



  }
