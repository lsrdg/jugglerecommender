import React,{Component} from 'react'
import store from "./stores/store"
import uiStore from "./stores/uiStore"
import './App.css';
import './autoComplete.css'

class AutoComplete extends Component {

	render() {
		const input = this.props.input
		const lowerCaseInput = this.props.input.toLowerCase()
		let matchedNames = []
	 	const options = Object.keys(store.library).map((key)=>{
	 		const name = store.library[key].name
	 		let lowerCaseName = store.library[key].name.toLowerCase()
	 		//ends with ball num
	 		const ballMatch = lowerCaseName.match(/\(\d+b\)$/)
	 		if(ballMatch){
	 			lowerCaseName = lowerCaseName.slice(0,ballMatch.index)
	 		}
	 		//avoid duplicates
	 		if(lowerCaseName.includes(lowerCaseInput) && !matchedNames.includes(lowerCaseName)){
	 			const matchIndex = lowerCaseName.indexOf(lowerCaseInput)
	 			matchedNames.push(lowerCaseName)
	 			return <div className="option" 
	 						onClick={()=>{this.props.setAutoCompletedName
	 								(input+lowerCaseName.substring(input.length))}}>
			 				<span>{name.slice(0,matchIndex)}</span>
			 				<span className="match">{name.slice(matchIndex,matchIndex+lowerCaseInput.length)}</span>
			 				<span>{name.slice(matchIndex+lowerCaseInput.length,)}</span>
	 					</div>
	 		}
	 	})
		return (
			<div className = "options">
				{uiStore.editingPopupTrick && matchedNames.length<2?null:options}
			</div>
		)
	  }
}
export default AutoComplete