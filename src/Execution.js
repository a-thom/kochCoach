/**
 * Created by sashthecash on 21/06/2017.
 */

const
    AlexaComplexAnswer = require( './sensory/alexa/AlexaComplexAnswer' ),
    objectPath = require('object-path');

class Execution {

	/**  @param {AlexaRequestVO} alexaRequest */
	static exec ( alexaRequest ) {
		return Promise.resolve( alexaRequest )
				.then( Execution.handleIntent )
				.then( alexaRequest => {
					alexaRequest.answer = AlexaComplexAnswer.buildComplexAnwser( alexaRequest );
					return alexaRequest;
				} )
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static handleIntent ( alexaRequest ) {

		// vui implementation magic 3 lines! Dont Touch!
		if ( alexaRequest.reqSessionData.subIntent &&
				alexaRequest.reqSessionData.subIntent [ alexaRequest.intentName ] ) {
			alexaRequest.intentName = alexaRequest.reqSessionData.subIntent [ alexaRequest.intentName ];
		}

		let intentMethod = alexaRequest.intentName;

		// alexaRequest.vReq     = {}; // data extracted out of the request
		// alexaRequest.vRes     = {}; // data generated to answer
		// alexaRequest.vResLoop = {}; // data generated to answer in loops

		/** check if a Method exists – named like the intent.. */
		return ( typeof Execution[ intentMethod ] === 'function' ) ?
		       Execution[ intentMethod ]( alexaRequest ) :
           Execution.GenericVuiRequest( alexaRequest );
  }
  
	/**  @param {AlexaRequestVO} alexaRequestVO */
	static GenericVuiRequest ( alexaRequest ) {
		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static LaunchRequest (alexaRequest) {
		let prevUsage;
		if(alexaRequest.getPermanent('firstUse') === undefined) {
			alexaRequest.savePermanent('firstUse', false);
			alexaRequest.intentName = 'LaunchRequestFirst';
		};
		alexaRequest.savePermanent('phase', 'startup')
		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static HelpIntent ( alexaRequest ) {
		if(alexaRequest.getPermanent('phase') === 'Kochen'){
			alexaRequest.intentName = 'HelpCooking';
		}
		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Inspiration (alexaRequest) {
		let choice = [];
		let ignoreList = [];
		if(alexaRequest.getPermanent('ignoreList') === undefined) {
			ignoreList.push(3);
		} else {
			ignoreList = alexaRequest.getPermanent('ignoreList');
		}
		console.log('ignoreList '+ignoreList);
		for(var i = 0; i<alexaRequest.dataBase.length; i++){
			let found = ignoreList.indexOf(i);
				if(found == -1){
					choice.push(i);
				}
		}
		if(choice.length == 0){
			ignoreList = [];
			for(var i = 0; i<alexaRequest.dataBase.length; i++){
				choice.push(i);
			}
		}
		let randomSelection = choice[Math.floor(Math.random() * choice.length)];
		ignoreList.push(randomSelection);
		alexaRequest.savePermanent('ignoreList', ignoreList);
		alexaRequest.savePermanent('index', randomSelection);
		alexaRequest.savePermanent('step', 0);
		alexaRequest.savePermanent('phase', 'searching');
		alexaRequest.vRes = { suggestion : alexaRequest.dataBase[randomSelection].name};
		return new Promise( resolve => resolve( alexaRequest ) );
  }

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Start (alexaRequest) {
		alexaRequest.savePermanent('phase', 'searching');
		//read slot resolution from JSON request
		let slotObject = alexaRequest.slots;
		let slots = {};
		for ( let slot in slotObject ) { slots[ slot ] = slotObject[ slot ];}
		let searchTerm = objectPath.get(slots, `rezepte.resolutions.resolutionsPerAuthority.0.values.0.value.name`);
		//todo: get whatever was said. possible?
		console.log("searchTerm: " + searchTerm);
		//get names of all available recipes
		let names = [];
		for(let i = 0; i < alexaRequest.dataBase.length; i++){
			names [i] = alexaRequest.dataBase[i].name;
		}
		//find slot value in names array
		let index = names.indexOf(searchTerm);
		if(index >= 0){
			alexaRequest.savePermanent('index', index);
			alexaRequest.savePermanent('step', 0);
			let recipeName = alexaRequest.dataBase[index].name;
			let recipeDuration = alexaRequest.dataBase[index].time;
			alexaRequest.vRes = { name : recipeName, duration: recipeDuration};
			alexaRequest.intentName = 'Rezept';
		} else {
			//get keyWords of all available recipes
			let keyWordsFound = [];
			for(let i = 0; i < alexaRequest.dataBase.length; i++){
				let words = alexaRequest.dataBase[i].keyWords;
				keyWordsFound [i] = words.split(', ');
			}
			console.log(keyWordsFound.length);
			//find slot value in keyWords array
			let resultsArray = [];
			for(var i = 0; i < keyWordsFound.length; i++) {
				var keyWords = keyWordsFound[i];
				console.log("searchTerm: " + searchTerm + keyWords);
				for(var j = 0; j < keyWords.length; j++) {
					if(keyWords[j] == searchTerm){

						resultsArray.push(i);
					}
				}
			}
			if(resultsArray.length == 0) {
				alexaRequest.intentName = 'NoRecipe';
			} else {
				let randomSelection = Math.floor(Math.random() * resultsArray.length);
				let index = resultsArray[randomSelection];
				let name = alexaRequest.dataBase[index].name;
				alexaRequest.savePermanent('index', index);
				alexaRequest.savePermanent('step', 0);
				alexaRequest.vRes = { search : searchTerm, name: name};
				alexaRequest.intentName = 'SthElse';
			}
			alexaRequest.intentName = 'NoRecipe'
		}
		return new Promise( resolve => resolve( alexaRequest ) );
	}

		/**  @param {AlexaRequestVO} alexaRequestVO */
	static Suche (alexaRequest){
		alexaRequest.savePermanent('phase', 'searching');
		//read slot resolution from JSON request
		let slotObject = alexaRequest.slots;
		let slots = {};
		for ( let slot in slotObject ) { slots[ slot ] = slotObject[ slot ];}
		let searchParameter = objectPath.get(slots, `parameter.resolutions.resolutionsPerAuthority.0.values.0.value.name`);
		console.log('searchFor: ' + searchParameter);

		//get keyWords of all available recipes
		let keyWordsFound = [];
		for(let i = 0; i < alexaRequest.dataBase.length; i++){
			let words = alexaRequest.dataBase[i].keyWords;
			keyWordsFound [i] = words.split(', ');
		}

		//find slot value in keyWords array
		let resultsArray = [];
		for(var i = 0; i < keyWordsFound.length; i++) {
			var keyWords = keyWordsFound[i];
			for(var j = 0; j < keyWords.length; j++) {
				if(keyWords[j] == searchParameter){
					resultsArray.push(i);
				}
			}
		}

		if(resultsArray.length == 0) {
			alexaRequest.intentName = 'NoResult';
		} else {
			let results = resultsArray.length;
			let index = resultsArray.shift();
			alexaRequest.savePermanent('results', resultsArray);
			let name = alexaRequest.dataBase[index].name;
			alexaRequest.savePermanent('index', index);
			alexaRequest.savePermanent('step', 0);
			if(resultsArray.length == 0) {
				alexaRequest.vRes = { name : name};
				alexaRequest.intentName = 'OneFound';
			} else {
				alexaRequest.savePermanent('phase', 'results');
				alexaRequest.vRes = { name : name, results: results};
			}
		}
		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Vorschlaege (alexaRequest){
		switch (alexaRequest.getPermanent('phase')){
			case('results'):
				if(alexaRequest.getPermanent('results') === undefined) {
					alexaRequest.intentName = 'NoSuggestions';
				} else {
					let list = alexaRequest.getPermanent('results');
					let index = list.shift();
					console.log(index);
					alexaRequest.savePermanent('results', list);
					alexaRequest.savePermanent('index', index);
					alexaRequest.savePermanent('step', 0);
					let recipeName = alexaRequest.dataBase[index].name;
					console.log(recipeName);
					console.log(list.length);
					if(list.length == 0) {
						console.log("in");
						alexaRequest.vRes = {lastName: recipeName};
						console.log(recipeName);
						alexaRequest.intentName = 'LastResult';
					}
				}
				break;
			case('searching'):
				alexaRequest.intentName = 'CatchStraysSearching';
				break;
			case('cooking'):
				alexaRequest.intentName = 'CatchStraysCooking';
				break;
			case('recipe'):
				alexaRequest.intentName = 'CatchStraysRecipe';
				break;
			default:
				break;
		}

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Rezept (alexaRequest) {
		if(alexaRequest.getPermanent('index') === undefined) {
			alexaRequest.intentName = 'NoRecipeSelected';
		} else {
			let index = alexaRequest.getPermanent('index');
			let recipeName = alexaRequest.dataBase[index].name;
			let recipeDuration = alexaRequest.dataBase[index].time;

			alexaRequest.vRes = {name: recipeName, duration: recipeDuration};
		}
		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static ZutatenListe (alexaRequest){
		//console.log("ingr: " + ingredients);
		if(alexaRequest.getPermanent('index') === undefined) {
			alexaRequest.intentName = 'NoRecipeSelected';
		} else {
			let index = alexaRequest.getPermanent('index');
			let ingredients = alexaRequest.dataBase[index].keyIngr;

			alexaRequest.vRes = { ingredients : ingredients };
		}

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static ZutatenVorlesen (alexaRequest){
		if(alexaRequest.getPermanent('index') === undefined) {
			alexaRequest.intentName = 'NoRecipeSelected';
		} else {
			let index = alexaRequest.getPermanent('index');
			let allIngredients = alexaRequest.dataBase[index].ingredients;
			alexaRequest.vRes = { ingredients : allIngredients };
		}

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Einkaufsliste (alexaRequest){
		if(alexaRequest.getPermanent('index') === undefined) {
			alexaRequest.intentName = 'NoRecipeSelected';
		} else {
			let index = alexaRequest.getPermanent('index');
			let ingredients = alexaRequest.dataBase[index].ingredients;
			alexaRequest.card.title = `Einkaufsliste für ${alexaRequest.dataBase[index].name}`;
			ingredients = ingredients.replace(/, /g, '\n');
			alexaRequest.card.content = ingredients;
			alexaRequest.card.image = alexaRequest.dataBase[index].image;
		}
		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Kurzanleitung (alexaRequest){
		if(alexaRequest.getPermanent('index') === undefined) {
			alexaRequest.intentName = 'NoRecipeSelected';
		} else {
			let index = alexaRequest.getPermanent('index');
			let sumup = alexaRequest.dataBase[index].sumup;
			alexaRequest.vRes = { summary : sumup };
		}

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Tipps (alexaRequest){
		if(alexaRequest.getPermanent('index') === undefined) {
			alexaRequest.intentName = 'NoRecipeSelected';
		} else {
			let step = alexaRequest.getPermanent('step') ;
			let index = alexaRequest.getPermanent('index');
			let column = `tipp${step}`;
			let tipp = alexaRequest.dataBase[index][column];
			if(tipp == ""){
				alexaRequest.intentName = "NoTipp";
			} else {
				alexaRequest.vRes = { tipp: tipp};
			}
		}
		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Kochen (alexaRequest) {
		if(alexaRequest.getPermanent('index') === undefined) {
			alexaRequest.intentName = 'NoRecipeSelected';
		} else {
			let index = alexaRequest.getPermanent('index');
			let recipeName = alexaRequest.dataBase[index].name;
			let recipeDuration = alexaRequest.dataBase[index].time;
			alexaRequest.vRes = { name : recipeName, duration: recipeDuration};
		}

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Weiter (alexaRequest) {
		if (alexaRequest.getPermanent('index') === undefined) {
			alexaRequest.intentName = 'NoRecipeSelected';
		} else {
			let step = alexaRequest.getPermanent('step') + 1 ;
			let index = alexaRequest.getPermanent('index');
			alexaRequest.savePermanent('step', step);

			let column = `step${step}`;
			let columnDur = `dur${step}`
			let instruction = alexaRequest.dataBase[index][column];
			let stepDuration = alexaRequest.dataBase[index][columnDur];

			console.log('instruction: ' + instruction);
			if (typeof instruction === 'string') {
				if (stepDuration < 3) {
					// todo: is this supposed to make a difference?
				} else {

				}
				//TODO: reply with a response instead of a complex answer?
				alexaRequest.vRes = {instruction: instruction};
			} else {
				alexaRequest.intentName = 'NoMoreSteps';
			}
		}
		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Wiederholen (alexaRequest) {
		if(alexaRequest.getPermanent('index') === undefined) {
			alexaRequest.intentName = 'NoRecipeSelected';
		} else {
			let step = alexaRequest.getPermanent('step');
			let index = alexaRequest.getPermanent('index');
			let column = `step${step}`;
			// let columnDur = `dur${step}`
			let instruction = alexaRequest.dataBase[index][column];
			// let stepDuration = alexaRequest.dataBase[index][columnDur];
			alexaRequest.vRes = { instruction: instruction};
		}

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Zurueck (alexaRequest) {
		if(alexaRequest.getPermanent('index') === undefined) {
			alexaRequest.intentName = 'NoRecipeSelected';
		} else {
			let step = alexaRequest.getPermanent('step') - 1 ;
			let index = alexaRequest.getPermanent('index');
			alexaRequest.savePermanent('step', step);

			let column = `step${step}`;
			// let columnDur = `dur${step}`
			let instruction = alexaRequest.dataBase[index][column];
			// let stepDuration = alexaRequest.dataBase[index][columnDur];
			console.log(instruction);
			alexaRequest.vRes = { instruction: instruction};
		}

		return new Promise( resolve => resolve( alexaRequest ) );
	}
}

module.exports = Execution;
