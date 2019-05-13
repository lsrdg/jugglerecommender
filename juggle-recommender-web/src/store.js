import { action, configure, computed, observable, toJS} from "mobx"
import {jugglingLibrary} from './jugglingLibrary.js'

configure({ enforceActions: "always" })
class Store {
	@observable myTricks = []
	@observable selectedTricks = []
	@observable selectedList = "allTricks"
	@observable rootTricks = []
	@observable nodes = []
	@observable edges = []
	@action addToMyTricks=(trickKey)=>{
 		this.myTricks.push(trickKey)
 		localStorage.setItem('myTricks', JSON.stringify(this.myTricks))
 		this.updateRootTricks()
 	}
 	@action setMyTricks=(tricks)=>{
 		this.myTricks = tricks
 		this.updateRootTricks()
 	}
 	@action removeFromMyTricks=(trickKey)=>{
 		var index = this.myTricks.indexOf(trickKey);
		if (index > -1) {
		  this.myTricks.splice(index, 1);
		}
 		localStorage.setItem('myTricks', JSON.stringify(this.myTricks))
 		this.updateRootTricks()
 	}
 	@action selectTricks=(selectedTricks)=>{
 		if (this.selectedTricks[0] === selectedTricks[0] && this.selectedTricks.length === 1){
			this.selectedTricks = []
	 	}else{
	 		this.selectedTricks = selectedTricks
	 	}
	 	this.updateRootTricks()
 	}
 	@action setSelectedList=(listType)=>{
 		this.selectedList = listType
 		this.updateRootTricks()
 	}
 	@action updateRootTricks=()=>{
	 	this.rootTricks = []
	 	if (this.selectedTricks.length > 0){
			this.rootTricks.push(
				this.selectedTricks[0]
			)
	 	}else{
		 	Object.keys(jugglingLibrary).forEach((trickKey, i) => {
				if(this.selectedList === "allTricks" || 
					this.selectedList === "myTricks" && this.myTricks.includes(trickKey)
				){
					const trick = jugglingLibrary[trickKey]
					let shouldPushTrick = true
					/*
					if (trick.num === 3 && this.state.expandedSections[3] &&
						(trick.name.includes(this.state.searchTrick) || 
							this.state.searchTrick === "")){
						shouldPushTrick = true
					}
					if (trick.num === 4 && this.state.expandedSections[4]){
						shouldPushTrick = true
					}
					if (trick.num === 5 && this.state.expandedSections[5]){
						shouldPushTrick = true
					}*/
					if (shouldPushTrick){

						this.rootTricks.push(
							trickKey
						)
					}
				}
			})
	 	}
	 	this.updateGraphData()
	}
	@action updateGraphData=()=>{
 		let nodes = []
 		let tempNodes = {}
 		let edges = []
	 	if(this.selectedList === "myTricks" ){
	 		this.rootTricks.forEach((trickKey)=>{
	 			const rootTrick = jugglingLibrary[trickKey]
	 			if(rootTrick.dependents || rootTrick.prereqs){
		 			tempNodes[trickKey] = {
		 				id: trickKey,
		 				name : rootTrick.name,
		 				involved : 100
		 			}
		 		}
		 		if(rootTrick.prereqs){
		 			rootTrick.prereqs.forEach((prereqKey)=>{
		 				const prereq = jugglingLibrary[prereqKey]
		 				if(!tempNodes[prereqKey]){
			 				tempNodes[prereqKey] = {
			 					id: prereqKey,
			 					name: prereq.name,
			 					involved : 40
			 				}
			 			}
		 				edges.push({ data: { source: trickKey, target: prereqKey } })

		 			})
		 		}
	 			if(rootTrick.dependents){
		 			rootTrick.dependents.forEach((dependentKey)=>{
		 				const dependent = jugglingLibrary[dependentKey]
			 			if(!tempNodes[dependentKey]){
			 				tempNodes[dependentKey] = {
			 					id: dependentKey,
			 					name: dependent.name,
			 					involved : 75
			 				}
			 			}
		 				edges.push({ data: { source: dependentKey, target: trickKey } })

		 			})
		 		}
 			})
	 	}else if(this.selectedList === "allTricks"){
	 		this.rootTricks.forEach((trickKey)=>{
	 			const rootTrick = jugglingLibrary[trickKey]
	 			const involvedRoot = this.myTricks.includes(trickKey) || 
	 							this.selectedTricks.includes(trickKey) ? 100 : 0
	 			if((rootTrick.dependents || rootTrick.prereqs) && (!tempNodes[trickKey]||tempNodes[trickKey].involved < involvedRoot)){
		 			tempNodes[trickKey] = {
		 				id: trickKey,
		 				name : rootTrick.name,
		 				involved : involvedRoot
		 			}
		 		}
	 			if(rootTrick.prereqs){
	 				rootTrick.prereqs.forEach((prereqKey)=>{
		 				const prereq = jugglingLibrary[prereqKey]
		 				let involvedPrereq = involvedRoot > 0 ? 40 : 0
		 				
		 				if(
		 					tempNodes[prereqKey] && 
		 					tempNodes[prereqKey].involved > involvedPrereq
		 				){
		 					involvedPrereq = tempNodes[prereqKey].involved
		 				}
		 				tempNodes[prereqKey] = {
		 					id: prereqKey,
		 					name: prereq.name,
		 					involved : involvedPrereq
		 				}

		 				edges.push({ data: { source: trickKey, target: prereqKey } })
			 		})
	 			}
 				if(rootTrick.dependents){
 					rootTrick.dependents.forEach((dependentKey)=>{
		 				const dependent = jugglingLibrary[dependentKey]
		 				let involvedDependent = involvedRoot > 0 ? 75 : 0
		 				if(tempNodes[dependentKey] && tempNodes[dependentKey].involved > involvedDependent){
		 					involvedDependent = tempNodes[dependentKey].involved
		 				}
		 				tempNodes[dependentKey] = {
		 					id: dependentKey,
		 					name: dependent.name,
		 					involved : involvedDependent
		 				}
		 				edges.push({ data: { source: dependentKey, target: trickKey } })
		 			})
 				}
 					
 			})
	 	}
	 	Object.keys(tempNodes).forEach((trickKey)=>{
	 		nodes.push({ data: {...tempNodes[trickKey]}})
	 	})
	 	this.nodes = nodes
	 	this.edges = edges
 	}
}

const store = new Store()

export default store