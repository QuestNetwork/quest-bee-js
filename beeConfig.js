import { v4 as uuidv4 } from 'uuid';
import { Subject } from 'rxjs';
import { Utilities } from '@questnetwork/quest-utilities-js'
import { NativeCrypto } from "@questnetwork/quest-crypto-js";
import { uniqueNamesGenerator, Config, adjectives, colors, animals, NumberDictionary } from 'unique-names-generator';

import { ElectronService } from 'ngx-electron';

export class BeeConfig {



  constructor() {

    this.config = {
      version: "0.9.4",
      appId: 'qDesk',
      channelKeyChain:   {},
      channelParticipantList: {},
      channelNameList: [],
      channelFolderList: [],
      favoriteFolderList: [],
      expandedChannelFolderItems: [],
      selectedChannel: "NoChannelSelected",
      sideBarFixed: { left: true, right: true},
      sideBarVisible: { left: true, right: false},
      inviteCodes: {},
      incomingFavoriteRequests: [],
      saveLock: false,
      dev: false
    };

    this.flatChannelFolderIdList = {};
    this.flatFavoriteFolderIdList = {};


    let uVar;
    this.version = uVar;
    this.isElectron = false;
    this.isNodeJS = false;
    this.crypto = new NativeCrypto();
    this.configPath = uVar;
    this.configFilePath = uVar;
    this.autoSaveInterval = uVar;
    this.fs = uVar;
    this.electron = new ElectronService();
    this.dolphin = uVar;
    this.commitChanges = false;
    this.sideBarVisibleSub = new Subject();
    this.sideBarFixedSub = new Subject();
    this.commitSub = new Subject();
    this.commitNowSub = new Subject();
    this.selectedChannelSub = new Subject();
    this.pFICache = uVar;
    this.hasConfigFlag = false;
    this.accName = "";
    this.customUnameNumberDictionary = NumberDictionary.generate({ min: 10, max: 99 });
    this.customUnameConfig = {
      dictionaries: [adjectives, colors, animals, this.customUnameNumberDictionary],
      separator: '-',
      length: 4,
   };
    this.saveLockStatusSub = new Subject();
    this.autoSaveRunning = false;
    this.jsonIpfsConfig = {};
    this.saveLock = false;

    this.parseAndImportParentIdCache = "";
    this.parseAndImportFavoriteParentIdCache = "";

    this.channelFolderListSub = new Subject();
    this.favoriteFolderListSub = new Subject();


    if (Utilities.engine.detect() == 'electron') {
      this.isElectron = true;
      this.fs = this.electron.remote.require('fs');
      this.configPath = this.electron.remote.app.getPath('userData');
      this.configFilePath = this.configPath + "/user.qcprofile";
    }
    else if (Utilities.engine.detect() == 'node') {
      this.isNodeJS = true;
      this.fs = require('fs');
      this.configPath = 'config';
      this.configFilePath = this.configPath + "/user.qcprofile";
    }

  }

  async start(config){
    this.accPwd = "";
    this.dev = config['dev'];

    this.version = config['version'];
    this.jsonIpfsConfig = config['ipfs'];
    this.saveAs = config['dependencies']['saveAs'];
    this.dolphin = config['dependencies']['dolphin'];




    this.commitNowSub.subscribe( (value) => {
      this.commitNow();
    });

    return true;
  }

  hasPassword(){
    if(typeof this.getComb('/settings/account/passwordSet') == 'boolean' && this.getComb('/settings/account/passwordSet') == true){
      return true;
    }
    return false;
  }

  async setPwd(password){
      this.accPwd = password;
  }

  async setPassword(oldPassword,newPassword){
    if(this.hasPassword()){
      //verify old password
      if(oldPassword != this.accPwd){
        throw('pwd');
      }
    }
    this.accPwd = newPassword;
    this.setComb('/settings/account/passwordSet', true);
    this.commitNow();
    return true;
  }



  getAccName(){
    if(typeof this.getComb('/settings/account/name') == 'string' && this.getComb('/settings/account/name').length > 0 && this.getComb('/settings/account/name') != 'qDesk User' && this.getComb('/settings/account/name') != '[object Object]'){
      this.accName = this.getComb('/settings/account/name');
      console.log('getting username from comb...')
    }else if(typeof this.accName != 'string' || this.accName.length < 1){
      this.accName = uniqueNamesGenerator(this.customUnameConfig);
      this.setComb('/settings/account/name', this.accName);
    }
    return this.accName
  }

  setAccName(name, setCombFlag = false){
    console.log('setting username...',name)
    console.log(typeof name);
    console.log(setCombFlag);
    if(typeof name == 'string' && name.length > 1 && name != 'qDesk User' && name != '[object Object]'){
      this.accName = name;
      if(setCombFlag){
        console.log('setting username to comb...',name)
        this.setComb('/settings/account/name', name);
      }
    }
  }

  setSelectedChannel(value){
    if(typeof value == 'undefined'){
      return false
    }

    // console.log('BeeConfig: Setting channel',value);
    this.config['selectedChannel'] = value;

  }
  getSelectedChannel(){
    return this.config['selectedChannel'];
  }

  getSaveLock(){
    return this.saveLock;
  }
  setSaveLock(value){
    this.saveLock = value;
    // this.saveLockStatusSub.next(value);
  }
  getAutoSave(){
    return this.config['autoSaveFlag'];
  }

  setAutoSave(value){
    if(value){
      this.enableAutoSave();
    }
    else{
      this.disableAutoSave();
    }
  }

  commit(){
    this.commitChanges = true;
  }

  enableAutoSave(){
    this.config['autoSaveFlag'] = true;
    if(!this.autoSaveRunning){
      this.autoSaveRunning = 1;
      this.autoSave();
    }
    this.commit();
  }

  disableAutoSave(){
    this['autoSaveFlag'] = false;
    this.commitNow();
  }
setAutoSaveInterval(value){
  this.config['autoSaveInterval'] = value;
  this.commit();
}
getAutoSaveInterval(value){
  return this.config['autoSaveInterval']
}
getIpfsConfig(){

  if(this.config['ipfs'] != 'undefined'){
    return this.config['ipfs'];
  }
  else{
    return this.jsonIpfsConfig;
  }
}
  async autoSave(){
    console.log('Bee: Running autoSave...');
        if(this.config['autoSaveFlag'] != 'undefined' && this.config['autoSaveFlag']  && this.commitChanges){
          this.commitNow();
          this.commitChanges = false;
        }
        if(this.config['autoSaveFlag'] != 'undefined' && this.config['autoSaveFlag']){
          await this.delay(this.config['autoSaveInterval']);
          this.autoSaveRunning = 0;
          this.autoSave();
        }
  }


 delay(t, val = "") {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(val);
        }, t);
    });
 }




  mergeSocial(){
    //START  merge social stuff until dependencies fixed
    let socialSharedWith = this.dolphin.getSocialSharedWith();
    for(let pubKey of socialSharedWith){
      if(!this.inComb('/social/sharedWith',pubKey)){
        this.addToComb('/social/sharedWith',pubKey, { commit: false });
      }
    }
    let socialProfiles = this.dolphin.getSocialProfiles();
    let socialPubKeys = Object.keys(socialProfiles);
    for(let pubKey of socialPubKeys){
      let profile = this.getComb('/social/profile/'+ pubKey);

      if(typeof profile['private'] == 'undefined'){
        this.setComb('/social/profile/'+ pubKey,socialProfiles[pubKey], { commit: false });
      }
      else if(typeof profile['private'] != 'undefined'){
        let socialProfile = socialProfiles[pubKey];

        profile['alias'] = socialProfiles[pubKey]['alias'];
        profile['fullName'] = socialProfiles[pubKey]['fullName'];
        profile['private'] = socialProfiles[pubKey]['private'];
        profile['about'] = socialProfiles[pubKey]['about'];

        if(socialProfiles[pubKey]['sig'] != 'undefined'){
          profile['sig'] = socialProfiles[pubKey]['sig'];
        }
        this.setComb('/social/profile/'+ pubKey,profile, { commit: false });
        if(typeof socialProfiles[pubKey]['timeline'] != 'undefined' && typeof(socialProfiles[pubKey]['timeline']['qHash']) != 'undefined' && typeof(socialProfiles[pubKey]['timeline']['whistle']) != 'undefined' && !this.isMyProfile(pubKey)){
          this.setComb('/social/timeline/'+ pubKey,socialProfiles[pubKey]['timeline'], { commit: false });
        }

      }
    }

    let dolphinLinks = this.dolphin.getSocialLinks();
    let combLinks = this.getComb('/social/links');
    let dolphinLinkKeys = Object.keys(dolphinLinks);
    for(let pubKey of dolphinLinkKeys){
      combLinks[pubKey] = dolphinLinks[pubKey];
    }
    this.setComb('/social/links',combLinks, { commit: false });
    //END  merge social stuff until dependencies fixed
  }

  isMyProfile(key){
    if(key == 'NoProfileSelected'){
      return true;
    }
    return this.inComb("/social/myprofiles",key);
  }

  commitNow(config = { export: false }){

    this.dev && console.log( this.getSaveLock());

    if(!config['export'] && this.getSaveLock()){
      return true;
    }

      // let folderList: TreeNode<FSEntry> = ;
      let autoSaveInterval = this.config['autoSaveInterval'];

      this.mergeSocial();

      this.commitChanges=false;
      this.config = {
        version: this.version,
        appId: 'qDesk',
        ipfs: this.getIpfsConfig(),
        channelKeyChain:   this.dolphin.getChannelKeyChain(),
        channelParticipantList: this.dolphin.getChannelParticipantList(),
        channelNameList: this.dolphin.getChannelNameList(),
        channelFolderList: this.getChannelFolderList(),
        favoriteFolderList: this.getFavoriteFolderList(),
        expandedChannelFolderItems: this.getExpandedChannelFolderItems(),
        expandedFavoriteFolderItems: this.getExpandedFavoriteFolderItems(),
        selectedChannel: this.getSelectedChannel(),
        sideBarFixed: this.getSideBarFixed(),
        sideBarVisible: this.getSideBarVisible(),
        inviteCodes: this.dolphin.getInviteCodes(),
        autoSaveInterval: this.getAutoSaveInterval(),
        autoSaveFlag: this.getAutoSave(),
        storageLocation: this.getStorageLocation(),
        dolphin: {
          channelConfig: this.dolphin.getChannelConfig()
        },
        comb: this.getComb(),
        incomingFavoriteRequests: this.dolphin.getIncomingFavoriteRequests(),

      };

      let unencrytpedObject;

      if(typeof this.config['appId'] == 'undefined'){
        throw('bad config');
      }
      else{
         unencrytpedObject = this.config;
      }

      let encryptedHex = "";
      if(!this.hasPassword){
        let {secret, aesEncryptedB64 } = this.crypto.aes.encrypt(unencrytpedObject);
        encryptedHex = Buffer.from(aesEncryptedB64,'base64').toString('hex');
        this.accPwd = secret;
      }
      else{
        let {secret, aesEncryptedB64 } = this.crypto.aes.encrypt(unencrytpedObject, this.accPwd, this.accName);
        encryptedHex = Buffer.from(aesEncryptedB64,'base64').toString('hex');
      }

      let saveAsDownload = false;
      if((this.isElectron || this.isNodeJS) && !config['export']){
        // console.log('saving...')
        this.fs.writeFileSync(this.configFilePath, '0x4f0x550x520x480x410x520x440x570x410x520x4b0x500x520x4f0x540x450x430x540x450x440x420x590x570x4f0x520x440x53',{encoding:'utf8',flag:'w'})
        let  {newSecret, key, iv} = this.crypto.aes.hashSecret(this.accPwd, this.accName, 15000);
        this.fs.writeFileSync(this.configFilePath+key+iv, encryptedHex,{encoding:'utf8',flag:'w'})
      }
      else if(config['export'] || this.config.storageLocation == "Download"){
        saveAsDownload = true;
      }
      else{
        try{
          window.localStorage.setItem('user-qcprofile', '0x4f0x550x520x480x410x520x440x570x410x520x4b0x500x520x4f0x540x450x430x540x450x440x420x590x570x4f0x520x440x53');
          let  {newSecret, key, iv} = this.crypto.aes.hashSecret(this.accPwd, this.accName, 15000);
          window.localStorage.setItem(key+iv, encryptedHex);

        }catch(e){
          saveAsDownload = true;
          console.log(e);
        }
      }

      if(saveAsDownload){
        let userProfileBlob = new Blob([ encryptedHex ], { type: 'text/plain;charset=utf-8' });
        this.saveAs(userProfileBlob, "profile.qcprofile");
      }

  }

  getConfig(){
    return this.config;
  }
  deleteConfig(){

          if(this.isElectron || this.isNodeJS){
            try{
              let {newSecret, key, iv} = this.crypto.aes.hashSecret(this.accPwd, this.accName, 15000);
              this.fs.unlinkSync(this.configFilePath+key+iv);
            }catch(e){console.log(e);}
          }

          try{
            let {newSecret, key, iv} = this.crypto.aes.hashSecret(this.accPwd, this.accName, 15000);
            window.localStorage.removeItem(key+iv);
          }catch(e){console.log(e);}

          this.accPwd = "";
          this.accName = "";

  }


  setStorageLocation(v){
    this.config['storageLocation'] = v;
  }
  getStorageLocation(){
    return this.config['storageLocation'];
  }

  hasConfig(){
    return this.hasConfigFlag;
  }
  hasConfigFile(){
    // console.log(this.isElectron);
    // console.log(this.configFilePath);
    if(this.isElectron || this.isNodeJS){
      return this.fs.existsSync(this.configFilePath);
    }
    return false;
  }
  hasAccessToLocalStorage(){
    let locTest = uuidv4();
    try {
      window.localStorage.setItem('locTest',locTest);
      if(window.localStorage.getItem('locTest') == locTest){
        window.localStorage.removeItem('locTest');
        return true;
      }
    } catch (e) {
      return false;
    }
  }
  readConfig(config = {}){
    // console.log('file?:',config);

    if((!this.isElectron && !this.isNodeJS) && typeof config['storageLocation'] != 'undefined'){
          this.setStorageLocation(config['storageLocation']);
    }

    if(typeof config == 'string'){
      //From Dropped File

      try{
        let encryptedHex = config;
        // console.log('file:',encryptedHex);
        // console.log(this.accPwd);
        config = this.crypto.aes.decryptHex(encryptedHex,this.accPwd,'utf8', this.accName);
        if(typeof config == 'string'){
          // console.log('file pwd wrong');
          throw('pwd');
        }
      }catch(e){
        console.log(e);
        throw('pwd');
      }

    }
    else if(this.isElectron || this.isNodeJS){
      //From Config File

      this.setStorageLocation('ConfigFile');


          let encryptedHex = "";
          try{
              let  {newSecret, key, iv} = this.crypto.aes.hashSecret(this.accPwd, this.accName, 15000);
               encryptedHex = this.fs.readFileSync(this.configFilePath+key+iv,"utf8");
               // console.log(encryptedHex);
          }catch(e){console.log(e)}

          if(encryptedHex.length > 0){
            try{
              // console.log('decrypting config...');
              let dec = this.crypto.aes.decryptHex(encryptedHex,this.accPwd, 'utf8',this.accName);
              //
              // if(typeof dec == 'string'){
              //   throw('pwd');
              // }
              if(typeof dec != 'object' || typeof dec['appId'] == 'undefined'){
                throw('pwd');
              }
              else{
                  config = dec;
              }

            }
            catch(e){
              console.log(e);
              throw('pwd');
            }
          }



    }
    else if((!this.isElectron && !this.isNodeJS) && this.hasAccessToLocalStorage()){
      //From Browser Storage

                  try{
                      //try to parse config out of local storage
                      this.setStorageLocation('LocalStorage');

                      let  {newSecret, key, iv} = this.crypto.aes.hashSecret(this.accPwd, this.accName, 15000);
                      let encryptedHex = window.localStorage.getItem(key+iv);
                      console.log(encryptedHex);
                      if(encryptedHex !== null){
                        try{
                          // console.log(this.accPwd);
                          // console.log(encryptedHex);
                          // console.log(this.crypto.aes.decryptHex(encryptedHex,this.accPwd))
                          let localStorage = this.crypto.aes.decryptHex(encryptedHex,this.accPwd, 'utf8',this.accName);
                          if(typeof localStorage == 'string'){
                            throw('pwd');
                          }
                          // console.log(localStorage);
                          if(typeof localStorage == 'object' && ( localStorage['version'] ==  "0.9.3" || localStorage['version'] == "0.9.4"  || localStorage['version'] == '0.9.5') ){
                            config = localStorage;
                            console.log(config);
                          }
                          else{
                            throw('pwd');
                          }
                        }catch(e){
                          console.log(e);
                          throw('bad password');
                        }
                      }
                      else if(typeof config['default'] == 'undefined'){
                        throw('bad password');
                      }

                  }catch(e){
                    if(e == 'bad password'){
                      throw('pwd');
                    }
                    console.log(e);
                  }
    }
    else{
          this.setStorageLocation('Download');
    }


    if(typeof config === null ){
      config = {};
    }



    //put config into pubsub
    if(typeof config['channelKeyChain'] != 'undefined' ){
      this.dolphin.setChannelKeyChain(config['channelKeyChain']);
    }
    if(typeof config['channelParticipantList'] != 'undefined'){
      console.log('Config: Importing ParticipantList ...',config['channelParticipantList']);
      this.dolphin.setChannelParticipantList(config['channelParticipantList']);
    }
    else{
        this.dolphin.setChannelParticipantList(this.config['channelParticipantList']);
    }
    if(typeof config['channelNameList'] != 'undefined'){
      console.log('Config: Importing channelNameList ...',config['channelNameList']);
      this.dolphin.setChannelNameList(config['channelNameList']);
    }
    else{
      this.dolphin.setChannelNameList(this.config['channelNameList']);
    }
    if(typeof config['channelFolderList'] != 'undefined'){
      console.log('Config: Importing Folder List ...',config['channelFolderList']);
      this.setChannelFolderList(config['channelFolderList']);
    }

    if(typeof config['favoriteFolderList'] != 'undefined'){
      console.log('Config: Importing Folder List ...',config['favoriteFolderList']);
      this.setFavoriteFolderList(config['favoriteFolderList']);
    }

    if(typeof(config['selectedChannel']) != 'undefined'){
      console.log('Config: Importing Selected Channel ...',config['selectedChannel']);
      this.setSelectedChannel(JSON.parse(JSON.stringify(config['selectedChannel'])));
    }

    if(typeof(config['sideBarFixed']) != 'undefined'){
      this.setSideBarFixed(config['sideBarFixed']);
    }
    if(typeof(config['sideBarVisible']) != 'undefined'){
      this.setSideBarVisible(config['sideBarVisible']);
    }

    if(typeof(config['inviteCodes']) != 'undefined' && Object.keys(config['inviteCodes']).length !== 0){
      this.dolphin.setInviteCodes(config['inviteCodes']);
    }

    if(typeof config['expandedChannelFolderItems']  !='undefined'){
      this.setExpandedChannelFolderItems(config['expandedChannelFolderItems']);
    }


    if(typeof config['expandedFavoriteFolderItems']  !='undefined'){
      this.setExpandedFavoriteFolderItems(config['expandeFavoriteFolderItems']);
    }

    if(typeof config['incomingFavoriteRequests']  !='undefined'){
      this.dolphin.setIncomingFavoriteRequests(config['incomingFavoriteRequests']);
    }

    if(typeof config['autoSaveInterval'] != 'undefined'){
      this.setAutoSaveInterval(config['autoSaveInterval']);
    }
    else{
        this.setAutoSaveInterval(30000);
    }

    if(typeof config['saveLock'] != 'undefined'){
      this.setSaveLock(config['saveLock']);
    }

    if(typeof config['ipfs'] != 'undefined'){
      this.setIpfsConfig(config['ipfs']);
    }

    if(typeof config['comb'] != 'undefined'){
      this.setComb("/",config['comb']);
    }

    if(typeof config['comb'] != 'undefined' && typeof config['comb']){
      this.setComb("/",config['comb']);
    }

    if(typeof config['dolphin'] != 'undefined' && typeof config['dolphin']['channelConfig'] != 'undefined'){
      this.dolphin.setChannelConfig(config['dolphin']['channelConfig']);
    }

    if(((this.isElectron || this.isNodeJS)&& typeof config['autoSaveFlag'] == 'undefined') || config['autoSaveFlag'] == true){
      this.enableAutoSave();
    }


    console.log("BeeConfig: Import Complete");

    this.hasConfigFlag = true;
    return true;
  }

  setIpfsConfig(p){
    this.config['ipfs'] = p;
    // this.commitNow();
  }

  setSideBarFixed(sideBarFixed){
    this.config.sideBarFixed = sideBarFixed
    this.sideBarFixedSub.next(sideBarFixed);
  }
  getSideBarFixed(){
      return this.config.sideBarFixed;
  }
  setSideBarVisible(sideBarVisible){
    this.config.sideBarVisible = sideBarVisible;
    this.sideBarVisibleSub.next(sideBarVisible);
  }
  getSideBarVisible(){
    return this.config.sideBarVisible;
  }

  newComb(path){
    if(typeof this.config['comb'] == 'undefined'){
      this.config['comb'] = {};
    }
    this.config['comb'][path] = {};
  }
  getComb(path = '/'){
    if(typeof this.config['comb'] == 'undefined'){
      return {};
    }
    else if(path == '/'){
      return this.config['comb'];
    }
    else if(typeof this.config['comb'][path] == 'undefined'){
      return {};
    }

    return this.config['comb'][path];
  }

  addToComb(path,item,  config = { commit: true }){
    this.dev && console.log( this.config['comb'][path]);

    if(typeof this.config['comb'] == 'undefined'){
       this.config['comb'] = {};
    }

    if(typeof this.config['comb'][path] == 'undefined'){
       this.config['comb'][path] = [];
    }

    this.config['comb'][path].push(item);

    this.dev && console.log(this.config['comb'][path]);

    if(config['commit']){
      this.commitNow();
    }
  }

  inComb(path,item){
    let a = this.getComb(path);
    let isInComb = Utilities.inArray(a,item);
    return isInComb;
  }

  setComb(path = '/', comb, config = { commit: true }){
    // console.log(comb);
    if(path == '/'){
      console.log('setting base comb');
      this.config['comb'] = comb;
    }
    else if(typeof this.config['comb'] == 'undefined' || this.config['comb'][path] == 'undefined'){
      this.newComb(path);
    }

    if(path != '/'){
      this.dev && console.log('setting nested comb');
      this.config['comb'][path] = comb;
    }
    if(config['commit']){
      this.commitNow();
    }
  }
  removeInComb(path,content){
    if(!typeof this.config['comb'][path] != 'undefined'){
      this.config['comb'][path] = this.config['comb'][path].filter(e => e != content);
      this.commitNow();
    }

  }
  removeCombPath(path){

  }
  removeFromComb(path, search){
    // console.log(search);
    // console.log(path);

    let comb = this.getComb(path);
    // console.log(comb);
    let searchKeys = Object.keys(search);
    let newComb = [];
    for(let iC= 0; iC<comb.length;iC++){
      let combItemStays = true;
      for(let i=0;i<searchKeys.length;i++){
        if(comb[iC][searchKeys[i]] == search[searchKeys[i]]){
          combItemStays = false;
          // console.log('found');
        }
      }

      if(combItemStays){
        newComb.push(comb[iC])
      }
    }

    this.config['comb'][path] = newComb;
    this.commitNow();
  }
  searchCombs(searchPath, ignore = ""){
    let all = this.config['comb'];
    let paths = Object.keys(all);
    let results = [];
    for(let path of paths){
      if(path.indexOf(searchPath) > -1 && path.indexOf(searchPath) < 2  ){
        results.push(this.getComb(path));
      }
    }
    return results;
  }

















  parseFolderStructureAndPushItem(chFL, parentFolderId = "", newFolder,ifdoesntexist = false){
    if(parentFolderId == ""){
      //check if exist at top level
      let exists = false;
      for (let i=0;i<chFL.length;i++){
        if(chFL[i]['data']['name'] == newFolder['data']['name']){
          exists = true;
          if(typeof chFL[i]['id'] == 'undefined'){
            chFL[i]['id'] = uuidv4();
          }
          parentFolderId = chFL[i]['id'];
          this.parseAndImportParentIdCache = parentFolderId;
        }
      }
      if(!exists){
        parentFolderId = newFolder['id'];
        this.parseAndImportParentIdCache = parentFolderId;
        chFL.push(newFolder);
      }
    }
    else{
        chFL = this.parseFolderStructureAndPushItemRec(chFL, parentFolderId, newFolder, true);
     }

     return chFL;
  }
  parseFolderStructureAndPushItemRec(chFL, parentFolderId = "", newFolder,ifdoesntexist = false){
    for(let i=0; i<chFL.length;i++){
            if(parentFolderId == chFL[i]['id'] || parentFolderId == chFL[i]['data']['name']){
              //we found the parent this is going into
              let exists = false;
              for (let chFLC_I=0;chFLC_I[i]<chFL[i]['children'].length;chFLC_I++){
                if(chFL[i]['children'][chFLC]['data']['name'] == newFolder['data']['name']){
                  exists = true;
                  if(typeof chFL[i]['id'] == 'undefined'){
                    chFL[i]['id'] = uuidv4();
                  }
                  parentFolderId = chFL[i]['id'];
                  this.parseAndImportParentIdCache = parentFolderId;
                }
              }
              if(!exists){
                chFL[i]['children'].push(newFolder);
                parentFolderId = newFolder['id'];
                this.parseAndImportParentIdCache = newFolder['id'];
              }
            }
            else{
                chFL[i]['children'] = this.parseFolderStructureAndPushItemRec(chFL[i]['children'], parentFolderId, newFolder, true);
             }
    }
    return chFL;
  }


  parseFolderStructureAndRemoveItem(folderStructure, channelName){
    folderStructure = folderStructure.filter(e => e['data']['name'] != channelName);

    for(let i=0;i<folderStructure.length;i++){
      if(typeof folderStructure[i]['children'] == 'undefined'){
         folderStructure[i]['children'] = [];
      }
      for (let i2=0;i2<folderStructure[i]['children'].length;i2++){
        folderStructure[i]['children'] = folderStructure[i]['children'].filter(e => e['data']['name'] != channelName);
      }
      if(typeof(folderStructure[i]['children']) != 'undefined'){
        folderStructure[i]['children'] = this.parseFolderStructureAndRemoveItem(folderStructure[i]['children'], channelName);
      }

    }
    return folderStructure;
  }

  parseFolderStructureAndRemoveItemById(folderStructure, id){
    folderStructure = folderStructure.filter(e => e['id'] != id);

    for(let i=0;i<folderStructure.length;i++){
      if(typeof folderStructure[i]['children'] == 'undefined'){
         folderStructure[i]['children'] = [];
      }
      for (let i2=0;i2<folderStructure[i]['children'].length;i2++){
        folderStructure[i]['children'] = folderStructure[i]['children'].filter(e => e['id'] != id);
      }
      if(typeof(folderStructure[i]['children']) != 'undefined'){
        folderStructure[i]['children'] = this.parseFolderStructureAndRemoveItemById(folderStructure[i]['children'], id);
      }

    }
    return folderStructure;
  }

    parseFolderStructureAndGetPath(folderStructure, channelName, path = []){
      path = this.parseFolderStructureAndGetPathProcess(folderStructure, channelName);
      path.shift();
      return path.reverse();
    }

    parseFolderStructureAndGetPathProcess(folderStructure, channelName, path = []){
      for(let i=0;i<folderStructure.length;i++){
        if(folderStructure[i]['data']['name'] == channelName){
          path.push("F");
         return path;
        }
        else{
          if(typeof folderStructure[i]['children'] != 'undefined'){
            let testPath = this.parseFolderStructureAndGetPathProcess(folderStructure[i]['children'], channelName, path);
            // console.log('PTEST:',testPath);
            if(testPath[0] == "F"){
              path = testPath;
              path.push(folderStructure[i]['data']['name']);
              return path;
            }

          }
        }
      }
      return path;
    }


    folderListToIDList(chFL, parentId = ""){
      let chIDL = {};
      console.log(chFL);
      for(let i=0;i<chFL.length;i++){



        if(typeof chFL[i]['id'] != 'undefined' && (typeof chFL[i]['children'] != 'undefined' && chFL[i]['children'].length > 0)){
          chIDL[chFL[i]['id']] = this.folderListToIDList(chFL[i]['children'], parentId = "");
          if(typeof chFL[i]['data']['kind'] != 'undefined' && chFL[i]['data']['kind'] == 'dir'){
            chIDL[chFL[i]['id']]['emptyFolder'] = {};
          }
        }
        else if(typeof chFL[i]['id'] != 'undefined' && (typeof chFL[i]['children'] == 'undefined' || chFL[i]['children'].length == 0)){
          chIDL[chFL[i]['id']] = {}
          if(typeof chFL[i]['data']['kind'] != 'undefined' && chFL[i]['data']['kind'] == 'dir'){
            chIDL[chFL[i]['id']]['emptyFolder'] = {};
          }

        }
        else if(typeof chFL[i]['id'] == 'undefined' && (typeof chFL[i]['children'] != 'undefined' && chFL[i]['children'].length > 0)){
          chIDL[chFL[i]['data']['name']] = this.folderListToIDList(chFL[i]['children'], parentId = "");
          if(typeof chFL[i]['data']['kind'] != 'undefined' && chFL[i]['data']['kind'] == 'dir'){
          chIDL[chFL[i]['data']['name']]['emptyFolder'] = {};
          }
        }
        else if(typeof chFL[i]['id'] == 'undefined'  && (typeof chFL[i]['children'] == 'undefined' || chFL[i]['children'].length == 0)){
          chIDL[chFL[i]['data']['name']] = {}
          if(typeof chFL[i]['data']['kind'] != 'undefined' && chFL[i]['data']['kind'] == 'dir'){
          chIDL[chFL[i]['data']['name']]['emptyFolder'] = {};
          }
        }
      }
      return chIDL;
    }
    checkIfFolderIdChannelsRec(chFL = [],id = "0"){
      // console.log(chFL);
      let foundChannels = false;
      for(let i=0;i<chFL.length;i++){
        // console.log("BeeConfig: Looking For Root Folder...");
        // console.log(id);
        // console.log(chFL[i]['id']);
        // console.log(chFL[i]['data']['name']);

        if(typeof chFL[i]['id'] !='undefined' && chFL[i]['id'] == id && typeof chFL[i]['children'] != 'undefined' && chFL[i]['children'].length > 0){
                //FOUND ROOT
              //we found the folder id, now check subfolders for channels
              // console.log('BeeConfig: Found Root Folder');
              let childHasChannels = false;
              // console.log('BeeConfig: Checking Root Folder For Channels');
              for(let i2 = 0;i2<chFL[i]['children'].length;i2++){
                  // console.log('BeeConfig: Testing Root....');
                  // console.log(chFL[i]['children'][i2]['data']['name']);
                  if((typeof chFL[i]['children'][i2]['id'] == 'undefined' && chFL[i]['children'][i2]['data']['name'].indexOf('-----') > -1) || chFL[i]['children'][i2]['id'].indexOf('-----') > -1 ){
                    return true;
                  }
                  else if(typeof chFL[i]['children'][i2]['children'] != 'undefined' &&  chFL[i]['children'][i2]['children'].length > 0 ){
                    if(this.checkIfFolderIdChannelsChildrenRec( chFL[i]['children'][i2]['children'])){
                      return true;
                    }
                  }
              }
        }
        else if(typeof chFL[i]['children'] !='undefined' && this.checkIfFolderIdChannelsRec( chFL[i]['children'], id)){
            return true
        }

      }

      return false;
    }
    checkIfFolderIdChannelsChildrenRec( chFL){
      // console.log('BeeConfig: Checking Sub Folder For Channels');
      for(let i =0;i<chFL.length;i++){
        for(let i2 = 0;i2<chFL.length;i2++){
            // console.log('BeeConfig: Testing Sub....');
            // console.log(chFL[i]['data']['name']);
            if((typeof chFL[i]['id'] != 'undefined' && chFL[i]['id'].indexOf('-----') > -1 )|| chFL[i]['data']['name'].indexOf('-----') > -1){
              return true;
            }
            else if(typeof chFL[i]['children'] != 'undefined' &&  chFL[i]['children'].length > 0 ){
              if(this.checkIfFolderIdChannelsChildrenRec(chFL[i]['children'])){
                return true;
              }
            }
        }
      }
    }



    isFolderItemFolderRec(chFL,id){

      for(let i=0;i<chFL.length;i++){
        if(typeof chFL[i]['id'] != 'undefined' && chFL[i]['id'] == id){
          if(typeof chFL[i]['data']['kind'] != 'undefined' && chFL[i]['data']['kind'] == 'dir'){
            return true;
          }
        }
        else if(typeof chFL[i]['children'] != 'undefined' && chFL[i]['children'].length > 0){
          let isFolder = this.isFolderItemFolderRec(chFL[i]['children'],id);
          if(isFolder){
            return true;
          }
        }
      }

      return false;
    }

    getFolderListChildrenRec(chFL,id){
      for(let i=0;i<chFL.length;i++){
        if(typeof chFL[i]['id'] !='undefined' && chFL[i]['id'] == id){
          if(typeof chFL[i]['children'] != 'undefined' && chFL[i]['children'].length > 0){
          return chFL[i]['children'];
          }
          else{
            return [];
          }
        }
        else if(typeof chFL[i]['data']['name'] !='undefined' && chFL[i]['data']['name'] == id){
          if(typeof chFL[i]['children'] != 'undefined' && chFL[i]['children'].length > 0){
            return chFL[i]['children'];
          }
          else{
            return [];
          }
        }
        else{
          return this.getFolderListChildrenRec(chFL[i]['children'],id);
        }
      }
      return [];
    }
    getFolderNameFromIdRec(chFL,id){
      for(let i=0;i<chFL.length;i++){
        if(typeof chFL[i]['id'] !='undefined' && chFL[i]['id'] == id){
          return chFL[i]['data']['name'];
        }
        else if(typeof chFL[i]['children'] != 'undefined' && chFL[i]['children'].length > 0){
          let testName = this.getFolderNameFromIdRec(chFL[i]['children'],id);
          if(testName != "NameNotFound"){
            return testName;
          }
        }
      }

      return "NameNotFound"
    }










































  getChannelFolderList(){
    // return JSON.parse(JSON.stringify());
    return this.config['channelFolderList'];
  }

  isChannelFolderItemFolder(id){
    return this.isChannelFolderItemFolderRec(this.getChannelFolderList(),id);
  }



  getFolderNameFromId(id){


      if(typeof this.flatChannelFolderIdList[id] != 'undefined'){
        return this.flatChannelFolderIdList[id];
      }

      // console.log('id:',id);
      let testName = this.getFolderNameFromIdRec(this.getChannelFolderList(),id);
      // console.log('name:',testName);

      if(testName != "NameNotFound"){
        this.flatChannelFolderIdList[id] = testName;
        return testName;
      }
      else{
        return id;
      }



  }

  checkIfFolderIdChannels(id){
    // console.log("BeeConfig: Testing Children For Channels...");
    let chFL = this.getChannelFolderList();
    if(typeof chFL == 'undefined'){
      throw('no folder list');
    }
    return this.checkIfFolderIdChannelsRec(chFL,id);
  }

  setExpandedChannelFolderItems(exp){
    this.dev && console.log('setting',exp);
    this.config['expandedChannelFolderItems'] = exp;
  }
  getExpandedChannelFolderItems(){
    if(typeof this.config['expandedChannelFolderItems'] != 'undefined'){
      return this.config['expandedChannelFolderItems'];
    }
    return [];
  }

  getChannelFolderIDList(){
    let chFL = this.config.channelFolderList;
    chFL = this.folderListToIDList(chFL);
    return chFL;
  }

  setChannelFolderList(list){
    this.config.channelFolderList = list;
    this.channelFolderListSub.next(list);
  }

  async createChannelFolder(newFolderNameDirty, parentFolderId = ""){
      let chfl = this.getChannelFolderList();
      let newFolder = { id: uuidv4(), data: { name: newFolderNameDirty, kind:"dir", items: 0 }, expanded: true, children: [] };
      if(parentFolderId == ""){
        chfl.push(newFolder);
      }
      else{
        chfl = this.parseFolderStructureAndPushItem(chfl, parentFolderId, newFolder);
     }
     this.setChannelFolderList(chfl);
     this.commitNow();
     this.channelFolderListSub.next(chfl);
   }
   async deleteFolder(folderId){
     this.setChannelFolderList(this.parseFolderStructureAndRemoveItemById(this.getChannelFolderList(),folderId));
     this.commitNow();
     return true;
   }

  getParseAndImportParentIdCache(){
    return this.parseAndImportParentIdCache;
  }

  isChannelFolderItemFolder(id){
    return this.isFolderItemFolderRec(this.getChannelFolderList(),id);
  }


  async addToChannelFolderList(channelNameClean, parentFolderId = "", newChannel = { data: { name: channelNameClean, kind:"rep", items: 0 }, expanded: true, children: [] }){
    let chfl = this.getChannelFolderList();
    if(parentFolderId == ""){
      chfl.push(newChannel);
    }
    else{
      chfl = this.parseFolderStructureAndPushItem(chfl, parentFolderId, newChannel);
   }
   this.setChannelFolderList(chfl);
   this.channelFolderListSub.next(chfl);

  }















































  getFavoriteFolderList(){
    // return JSON.parse(JSON.stringify());
    if(typeof this.config['favoriteFolderList'] == 'undefined'){
       this.config['favoriteFolderList'] = [];
    }

    return this.config['favoriteFolderList'];
  }

  getFavoriteFolderNameFromId(id){


      if(typeof this.flatFavoriteFolderIdList[id] != 'undefined'){
        return this.flatFavoriteFolderIdList[id];
      }

      // console.log('id:',id);
      // console.log('folderlist:',this.getFavoriteFolderList());
      let testName = this.getFolderNameFromIdRec(this.getFavoriteFolderList(),id);
      // console.log('name:',testName);

      if(testName != "NameNotFound"){
        this.flatFavoriteFolderIdList[id] = testName;
        return testName;
      }
      else{
        return id;
      }



  }

  checkIfFavoriteFolderIdChannels(id){
    // console.log("BeeConfig: Testing Children For Favorites...");
    let chFL = this.getFavoriteFolderList();
    if(typeof chFL == 'undefined'){
      throw('no folder list');
    }
    return this.checkIfFolderIdChannelsRec(chFL,id);
  }

  setExpandedFavoriteFolderItems(exp){
    this.div && console.log('setting',exp);
    this.config['expandedFavoriteFolderItems'] = exp;
  }
  getExpandedFavoriteFolderItems(){
    if(typeof this.config['expandedFavoriteFolderItems'] != 'undefined'){
      return this.config['expandedFavoriteFolderItems'];
    }
    return [];
  }

  getFavoriteFolderIDList(){
    let chFL = this.config['favoriteFolderList'];
    chFL = this.folderListToIDList(chFL);
    return chFL;
  }

  setFavoriteFolderList(list){
    this.config['favoriteFolderList'] = list;
    this.favoriteFolderListSub.next(list);
  }

  async createFavoriteFolder(newFolderNameDirty, parentFolderId = ""){
      let chfl = this.getFavoriteFolderList();
      let newFolder = { id: uuidv4(), data: { name: newFolderNameDirty, kind:"dir", items: 0 }, expanded: true, children: [] };
      if(parentFolderId == ""){
        chfl.push(newFolder);
      }
      else{
        chfl = this.parseFolderStructureAndPushItem(chfl, parentFolderId, newFolder);
     }
     this.setFavoriteFolderList(chfl);
     this.commitNow();
     this.favoriteFolderListSub.next(chfl);
   }
   async deleteFavoriteFolder(folderId){
     this.setFavoriteFolderList(this.parseFolderStructureAndRemoveItemById(this.getFavoriteFolderList(),folderId));
     this.commitNow();
     return true;
   }



  getParseAndImportFavoriteParentIdCache(){
    return this.parseAndImportFavoriteParentIdCache;
  }

  async addToFavoriteFolderList(channelNameClean, parentFolderId = "", newChannel = { data: { name: channelNameClean, kind:"rep", items: 0 }, expanded: true, children: [] }){
    let chfl = this.getFavoriteFolderList();
    if(parentFolderId == ""){
      chfl.push(newChannel);
    }
    else{
      chfl = this.parseFolderStructureAndPushItem(chfl, parentFolderId, newChannel);
   }
   this.setFavoriteFolderList(chfl);
   this.favoriteFolderListSub.next(chfl);

  }





























}
