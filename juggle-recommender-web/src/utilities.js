import {action, configure} from "mobx"
import store from './stores/store'
import ReactGA from 'react-ga';

configure({ enforceActions: "always" })
class Utilities{
  @action isEmptyOrSpaces=(str)=>{
    let strEmpty = false
    if (str === null){
      strEmpty = true
    }else if(!str.toString().replace(/\s/g, '').length){
      strEmpty = true
    }
    return strEmpty
  }

  @action isNotOnlyDigits=(str)=>{
      str = str.toString()
      return str.match(/^[0-9]+$/) === null;
  }
  @action isNotOnlyDigitsOrDecimal=(str)=>{
      str = str.toString()
      var isNumber = /^\d*\.?\d+$/.test(str)
      return !isNumber;
  }

  @action formatListCatches(catches){    
    if (!catches){
      return '0'
    }
    catches = parseInt(catches,10)
    if (catches<1000){
      return catches
    }
    if (catches>999 && catches<10000){
      return ((catches/1000).toFixed(1)+"K")
    }
    if (catches>10000){
      return (parseInt(catches/1000)+"K")
    }
  }
  

  @action isValidTime=(str)=>{
    let isValid = false
    str = str.toString()
    if (str.match(/^[0-9]+$/) === null){
      if (str.match(/^.+:\d+$/)){
        isValid = true
      }
    }else{
      isValid = true
    }
    return isValid
  }

  @action formatSeconds=(str)=>{
    str = str.toString()
    let toReturn
    if (str.includes(":")){
      toReturn = (parseInt(str.split(":")[0],10)*60)+(parseInt(str.split(":")[1],10))
    }else{
      toReturn = parseInt(str,10)
    }
    if (toReturn === 0){
      toReturn = 1
    }
    return toReturn
  }
  @action sendGA(cat, act, lab){
  if(!store.isLocalHost){
      if (lab){
        ReactGA.event({
            category: cat,
            action: act,
            label: lab,
        });
      }
      else{
        ReactGA.event({
            category: cat,
            action: act,
        });
      }
    } 
  }

  @action objectToArray=(object)=>{
      return Object.keys(object).map((key)=>{
          object[key]["key"] = key
          return object[key]
      }) 
  }

  @action sortObjectByAttribute(data, attr) {
    var arr = [];
    for (var prop in data) {
      if (data.hasOwnProperty(prop)) {
        var obj = {};
        obj[prop] = data[prop];
        if (attr === "random"){
          obj.tempSortName = Math.floor((Math.random() * 1000000));
        }else{
          obj.tempSortName = data[prop][attr];
        }
        arr.push(obj);
      }
    }    
    arr.sort(function(a, b) {
      var at, bt
      if(attr === "alphabetical"){
        at = a.tempSortName
        bt = b.tempSortName
      }else{
        at = parseFloat(a.tempSortName)*10;
        bt = parseFloat(b.tempSortName)*10;
      }
      return at > bt ? 1 : ( at < bt ? -1 : 0 );               
    });    
    return arr;
  }

  @action isValidVideoURL(videoURL){
    let isValid = false
    if (videoURL.includes("instagram.com") || 
        videoURL.includes("youtu")){
      isValid = true                               
    }
    return isValid
  }
  
  @action autoGrow(element){
      element.style.height = "5px"
      element.style.height = element.scrollHeight+"px"
  }

  relatedTrickScoringFunction(x){
    return 1+1/(-.05*x - 1)
  }
  currentTrickScoringFunction(x){
    return -1*(1+1/(-.15*x - 1)) + 1
  }
  calculateX(trickKey){
    let x
    const trick = store.library[trickKey]
    const numBalls = trick.num
    const myTrick  = store.myTricks[trickKey] ? store.myTricks[trickKey] : null
    const numHands = 2 
    if(myTrick && myTrick.catches > 0){
       x = myTrick.catches/(numBalls*numHands)
    }else if(myTrick && !myTrick.catches && (myTrick.ninja || myTrick.baby)){
      if(myTrick.baby){
        x = numBalls*numHands
      }else{
        x = numBalls*numHands*15
      }
    }else{
      x = 0
    }
    console.log("x",x)
    return x
  }
  calculateRandomTrickScore(trickKey){
    trickKey = "Takeouts"    
    
    const currentTrickScore = this.currentTrickScoringFunction(this.calculateX(trickKey))
    let relatedTricksScore = 0
    let relationshipList = ["prereqs","dependents","related"]
    const trick = store.library[trickKey]

    relationshipList.forEach((relation)=>{
      console.log("relation", relation)
      if(trick[relation]){
        Object.keys(trick[relation]).forEach((relatedTrickKey)=>{
          console.log("key", relatedTrickKey)
          relatedTricksScore += this.relatedTrickScoringFunction(this.calculateX(relatedTrickKey))
          console.log("score", relatedTricksScore)
        })
      }
    })
    
    console.log("current trick score", currentTrickScore,relatedTricksScore)
  }

}
const utilites = new Utilities()

export default utilites