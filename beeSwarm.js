import * as Ipfs from 'ipfs';
const { v4: uuidv4 } = require('uuid');
import { Subject } from "rxjs";
// import { Ocean }  from '@questnetwork/quest-ocean-js';

export class BeeSwarm {
    constructor() {
      // let uVar;
      // this.ocean = Ocean;
      // this.ready = false;
      // this.isReadySub = new Subject();
    }

    delay(t, val = "") {
       return new Promise(function(resolve) {
           setTimeout(function() {
               resolve(val);
           }, t);
       });
    }

  

  }
