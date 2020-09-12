// import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Subject } from 'rxjs';

// import { saveAs } from 'file-saver';
//
// interface TreeNode<T> {
//   data: T;
//   children?: TreeNode<T>[];
//   expanded?: boolean;
// }
//
// interface FSEntry {
//   name: string;
//   kind: string;
//   items?: number;
// }



export class BeeConfig {



  constructor() {

    this.config = {
      version: "0.9.2",
      appId: 'quest-messenger-js',
      channelKeyChain:   {},
      channelParticipantList: {},
      channelNameList: [],
      channelFolderList: [],
      expandedChannelFolderItems: [],
      selectedChannel: "NoChannelSelected",
      sideBarFixed: { left: true, right: true},
      sideBarVisible: { left: true, right: false},
      inviteCodes: {},
      saveLock: false
    };

    this.flatChannelFolderIdList = {};

    let uVar;
    this.version = uVar;
    this.isElectron = false;
    this.configPath = uVar;
    this.configFilePath = uVar;
    this.autoSaveInterval = uVar;
    this.fs = uVar;
    this.electron = uVar;
    this.dolphin = uVar;
    this.commitChanges = false;
    this.channelFolderListSub = new Subject();
    this.sideBarVisibleSub = new Subject();
    this.sideBarFixedSub = new Subject();
    this.commitSub = new Subject();
    this.commitNowSub = new Subject();
    this.selectedChannelSub = new Subject();
    this.pFICache = uVar;
    this.hasConfigFlag = false;
    this.parseAndImportParentIdCache = "";
    this.saveLockStatusSub = new Subject();
    this.autoSaveRunning = false;
    this.jsonSwarm = {};
    this.saveLock = false;


  }

  async start(config){

    this.version = config['version'];
    this.jsonSwarm = config['ipfs']['swarm'];
    this.electron = config['dependencies']['electronService'];
    this.saveAs = config['dependencies']['saveAs'];
    this.dolphin = config['dependencies']['dolphin'];

    var userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf(' electron/') > -1) {
      this.isElectron = true;
      this.fs = this.electron.remote.require('fs');
      this.configPath = this.electron.remote.app.getPath('userData');
      this.configFilePath = this.configPath + "/user.qcprofile";
    }

    this.commitNowSub.subscribe( (value) => {
      this.commitNow();
    });

    this.selectedChannelSub.subscribe( (value) => {
      this.config['selectedChannel'] = value;
      this.commit();
    });

    return true;
  }

  selectChannel(channelName){
    this.config['selectedChannel'] = channelName;
    this.commit();
    return true;
  }
  setSelectedChannel(value){
    this.config['selectedChannel'] = value;
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
getIpfsBootstrapPeers(){

  if(this.config['ipfsBootstrapPeers'] != 'undefined'){
    return this.config['ipfsBootstrapPeers'];
  }
  else{
    return this.jsonSwarm;
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

    isInArray(value, array) {
     return array.indexOf(value) > -1;
   }
   delay(t, val = "") {
      return new Promise(function(resolve) {
          setTimeout(function() {
              resolve(val);
          }, t);
      });
   }

  getChannelFolderList(){
    // return JSON.parse(JSON.stringify());
    return this.config['channelFolderList'];
  }

  isChannelFolderItemFolder(id){
    return this.isChannelFolderItemFolderRec(this.getChannelFolderList(),id);
  }

  isChannelFolderItemFolderRec(chFL,id){

    for(let i=0;i<chFL.length;i++){
      if(typeof chFL[i]['id'] != 'undefined' && chFL[i]['id'] == id){
        if(typeof chFL[i]['data']['kind'] != 'undefined' && chFL[i]['data']['kind'] == 'dir'){
          return true;
        }
      }
      else if(typeof chFL[i]['children'] != 'undefined' && chFL[i]['children'].length > 0){
        let isFolder = this.isChannelFolderItemFolderRec(chFL[i]['children'],id);
        if(isFolder){
          return true;
        }
      }
    }

    return false;
  }


 getFolderNameFromId(id){


      if(typeof this.flatChannelFolderIdList[id] != 'undefined'){
        return this.flatChannelFolderIdList[id];
      }

      console.log('id:',id);
      let testName = this.getFolderNameFromIdRec(this.getChannelFolderList(),id);
      console.log('name:',testName);

      if(testName != "NameNotFound"){
        this.flatChannelFolderIdList[id] = testName;
        return testName;
      }
      else{
        return id;
      }



  }
  getChannelListChildren(idOrName){

  }
  getChannelListChildrenRec(chFL,id){
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
        return this.getChannelListChildrenRec(chFL[i]['children'],id);
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
  checkIfFolderIdChannels(id){
    console.log("BeeConfig: Testing Children For Channels...");
    let chFL = this.getChannelFolderList();
    if(typeof chFL == 'undefined'){
      throw('no folder list');
    }
    return this.checkIfFolderIdChannelsRec(chFL,id);
  }
  checkIfFolderIdChannelsRec(chFL = [],id = "0"){
    console.log(chFL);
    let foundChannels = false;
    for(let i=0;i<chFL.length;i++){
      console.log("BeeConfig: Looking For Root Folder...");
      console.log(id);
      console.log(chFL[i]['id']);
      console.log(chFL[i]['data']['name']);

      if(typeof chFL[i]['id'] !='undefined' && chFL[i]['id'] == id && typeof chFL[i]['children'] != 'undefined' && chFL[i]['children'].length > 0){
              //FOUND ROOT
            //we found the folder id, now check subfolders for channels
            console.log('BeeConfig: Found Root Folder');
            let childHasChannels = false;
            console.log('BeeConfig: Checking Root Folder For Channels');
            for(let i2 = 0;i2<chFL[i]['children'].length;i2++){
                console.log('BeeConfig: Testing Root....');
                console.log(chFL[i]['children'][i2]['data']['name']);
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
    console.log('BeeConfig: Checking Sub Folder For Channels');
    for(let i =0;i<chFL.length;i++){
      for(let i2 = 0;i2<chFL.length;i2++){
          console.log('BeeConfig: Testing Sub....');
          console.log(chFL[i]['data']['name']);
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

  setExpandedChannelFolderItems(exp){
    console.log('setting',exp);
    this.config['expandedChannelFolderItems'] = exp;
  }
  getExpandedChannelFolderItems(){
    if(typeof this.config['expandedChannelFolderItems'] != 'undefined'){
      return this.config['expandedChannelFolderItems'];
    }
    return [];
  }

  channelFolderListToChannelFolderIDList(chFL, parentId = ""){
    let chIDL = {};
    console.log(chFL);
    for(let i=0;i<chFL.length;i++){



      if(typeof chFL[i]['id'] != 'undefined' && (typeof chFL[i]['children'] != 'undefined' && chFL[i]['children'].length > 0)){
        chIDL[chFL[i]['id']] = this.channelFolderListToChannelFolderIDList(chFL[i]['children'], parentId = "");
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
        chIDL[chFL[i]['data']['name']] = this.channelFolderListToChannelFolderIDList(chFL[i]['children'], parentId = "");
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
  getChannelFolderIDList(){
    let chFL = this.config.channelFolderList;
    chFL = this.channelFolderListToChannelFolderIDList(chFL);
    return chFL;
  }

  commitNow(config = { export: false }){

    console.log( this.getSaveLock());

    if(!config['export'] && this.getSaveLock()){
      return true;
    }

      // let folderList: TreeNode<FSEntry> = ;
      let autoSaveInterval = this.config['autoSaveInterval'];

      this.commitChanges=false;
      this.config = {
        version: this.version,
        appId: 'quest-messenger-js',
        ipfsBootstrapPeers: this.getIpfsBootstrapPeers(),
        channelKeyChain:   this.dolphin.getChannelKeyChain(),
        channelParticipantList: this.dolphin.getChannelParticipantList(),
        channelNameList: this.dolphin.getChannelNameList(),
        channelFolderList: this.getChannelFolderList(),
        expandedChannelFolderItems: this.getExpandedChannelFolderItems(),
        selectedChannel: this.dolphin.getSelectedChannel(),
        sideBarFixed: this.getSideBarFixed(),
        sideBarVisible: this.getSideBarVisible(),
        inviteCodes: this.dolphin.getInviteCodes(),
        autoSaveInterval: this.getAutoSaveInterval(),
        autoSaveFlag: this.getAutoSave(),
        dolphin: {
          channelConfig: this.dolphin.getChannelConfig()
        }

      };

      if(this.isElectron && !config['export']){
        this.fs.writeFileSync(this.configFilePath, JSON.stringify(this.config),{encoding:'utf8',flag:'w'})
      }
      else{
        let userProfileBlob = new Blob([ JSON.stringify(this.config)], { type: 'text/plain;charset=utf-8' });
        this.saveAs(userProfileBlob, "profile.qcprofile");
      }

  }
  getConfig(){
    return this.config;
  }
  deleteConfig(){

          if(this.isElectron){
            this.fs.unlinkSync(this.configFilePath);
          }

  }
  setChannelFolderList(list){
    this.config.channelFolderList = list;
    this.channelFolderListSub.next(list);
  }


  hasConfig(){
    return this.hasConfigFlag;
  }
  hasConfigFile(){
    if(this.isElectron){
      return this.fs.existsSync(this.configFilePath);
    }
    return false;
  }
  readConfig(config = {}){
    try{
      if(this.isElectron){
       config = JSON.parse(this.fs.readFileSync(this.configFilePath,"utf8"));
      }
    }catch(error){console.log(error);}
    //put config into pubsub
    if(typeof(config['channelKeyChain']) != 'undefined'){
      this.dolphin.setChannelKeyChain(config['channelKeyChain']);
    }
    if(typeof(config['channelParticipantList']) != 'undefined'){
      console.log('Config: Importing ParticipantList ...',config['channelParticipantList']);
      this.dolphin.setChannelParticipantList(config['channelParticipantList']);
    }
    else{
        this.dolphin.setChannelParticipantList(this.config['channelParticipantList']);
    }
    if(typeof(config['channelNameList']) != 'undefined'){
      console.log('Config: Importing channelNameList ...',config['channelNameList']);
      this.dolphin.setChannelNameList(config['channelNameList']);
    }
    else{
      this.dolphin.setChannelNameList(this.config['channelNameList']);
    }
    if(typeof(config['channelFolderList']) != 'undefined'){
      console.log('Config: Importing Folder List ...',config['channelFolderList']);
      this.setChannelFolderList(config['channelFolderList']);
    }
    if(typeof(config['selectedChannel']) != 'undefined'){
      console.log('Config: Importing Selected Channel ...',config['selectedChannel']);
      this.setSelectedChannel(config['selectedChannel']);
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
    if((this.isElectron && typeof config['autoSaveFlag'] == 'undefined') || config['autoSaveFlag'] == true){
      this.enableAutoSave();
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

    if(typeof config['ipfsBootstrapPeers'] != 'undefined'){
      this.setIpfsBootstrapPeers(config['ipfsBootstrapPeers']);
    }

    if(typeof config['dolphin'] != 'undefined' && typeof config['dolphin']['channelConfig'] != 'undefined'){
      this.dolphin.setChannelConfig(config['dolphin']['channelConfig']);
    }

    this.hasConfigFlag = true;
    return true;
  }

  setIpfsBootstrapPeers(p){
    this.config['ipfsBootstrapPeers'] = p;
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


  async createFolder(newFolderNameDirty, parentFolderId = ""){
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







}
