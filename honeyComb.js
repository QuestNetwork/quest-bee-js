import { v4 as uuidv4 } from 'uuid';
import { Subject } from 'rxjs';

export class HoneyComb {

  constructor(beeConfig) {
    this.beeConfig = beeConfig;
  }

  new(path){
    this.beeConfig.newComb(path);
  }

  get(path){
    return this.beeConfig.getComb(path);
  }

  set(path, comb){
    this.beeConfig.setComb(path, comb);
  }

  add(path, item){
      this.beeConfig.addToComb(path, item);
  }


  in(path,item){
    return this.beeConfig.inComb(path,item);
  }

  removeIn(path,content){
    this.beeConfig.removeInComb(path,content);
  }
  removeCombPath(path){

  }
  removeFrom(path, search){
    this.beeConfig.removeFromComb(path, search);
  }


}
