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
		console.log(alexaRequest.getPermanent('firstUse'));
		if(alexaRequest.getPermanent('firstUse') == "undefined") {
			alexaRequest.savePermanent('firstUse', 'false');
			alexaRequest.intentName = 'LaunchRequestFirst';
		};

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Inspiration (alexaRequest) {
		let randomSelection = Math.floor(Math.random() * alexaRequest.dataBase.length);
		alexaRequest.savePermanent('index', randomSelection);
		alexaRequest.savePermanent('step', 0);
		alexaRequest.vRes = { suggestion : alexaRequest.dataBase[randomSelection].name};
		return new Promise( resolve => resolve( alexaRequest ) );
  }

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Start (alexaRequest) {
		//read slot resolution from JSON request
		let slotObject = alexaRequest.slots;
		let slots = {};
		for ( let slot in slotObject ) { slots[ slot ] = slotObject[ slot ];}
		let recipe = objectPath.get(slots, `rezepte.resolutions.resolutionsPerAuthority.0.values.0.value.name`);
		console.log('recipe: ' + recipe);

		//get names of all available recipes
		let names = [];
		for(let i = 0; i < alexaRequest.dataBase.length; i++){
			names [i] = alexaRequest.dataBase[i].name;
		}
		//find slot value in names array
		let index = names.indexOf(recipe);
		if(index >= 0){
			alexaRequest.savePermanent('index', index);
			alexaRequest.savePermanent('step', 0);
			let recipeName = alexaRequest.dataBase[index].name;
			let recipeDuration = alexaRequest.dataBase[index].time;
			alexaRequest.vRes = { name : recipeName, duration: recipeDuration};
			alexaRequest.intentName = 'Rezept';
		} else {
			alexaRequest.intentName = 'NoRecipe'
		}
		return new Promise( resolve => resolve( alexaRequest ) );
	}

		/**  @param {AlexaRequestVO} alexaRequestVO */
	static Suche (alexaRequest){
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
				alexaRequest.vRes = { name : name, results: results};
			}
		}
		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Vorschlaege (alexaRequest){
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
			alexaRequest.vRes = { lastName : recipeName };
			console.log(recipeName);
			alexaRequest.intentName = 'LastResult';
		}
		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Rezept (alexaRequest) {
		let index = alexaRequest.getPermanent('index');
		let recipeName = alexaRequest.dataBase[index].name;
		let recipeDuration = alexaRequest.dataBase[index].time;

		alexaRequest.vRes = { name : recipeName, duration: recipeDuration};

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static ZutatenListe (alexaRequest){
		//console.log("ingr: " + ingredients);
		let index = alexaRequest.getPermanent('index');
		let ingredients = alexaRequest.dataBase[index].keyIngr;

		alexaRequest.vRes = { ingredients : ingredients };

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static ZutatenVorlesen (alexaRequest){
		let index = alexaRequest.getPermanent('index');
		let allIngredients = alexaRequest.dataBase[index].ingredients;
		alexaRequest.vRes = { ingredients : allIngredients };

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Einkaufsliste (alexaRequest){
		let index = alexaRequest.getPermanent('index');
		let ingredients = alexaRequest.dataBase[index].ingredients;
		alexaRequest.cardTitle = `Einkaufsliste für ${alexaRequest.dataBase[index].name}`;
		ingredients = ingredients.replace(/, /g, '\r');
		alexaRequest.cardContent = ingredients;
		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Kurzanleitung (alexaRequest){
		let index = alexaRequest.getPermanent('index');
		let sumup = alexaRequest.dataBase[index].sumup;
		alexaRequest.vRes = { summary : sumup };
		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Tipps (alexaRequest){

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Kochen (alexaRequest) {
		let step = alexaRequest.getPermanent('step') ;
		let index = alexaRequest.getPermanent('index');
		let recipeName = alexaRequest.dataBase[index].name;
		let recipeDuration = alexaRequest.dataBase[index].time;
		alexaRequest.vRes = { name : recipeName, duration: recipeDuration};

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Weiter (alexaRequest) {
    let step = alexaRequest.getPermanent('step') + 1 ;
    let index = alexaRequest.getPermanent('index');
    alexaRequest.savePermanent('step', step);

    let column = `step${step}`;
    let columnDur = `dur${step}`
    let instruction = alexaRequest.dataBase[index][column];
    let stepDuration = alexaRequest.dataBase[index][columnDur];

    if(stepDuration<3){
    	//todo: is this supposed to make a difference?
		} else {}

    //TODO: reply with a response instead of a complex answer?
    alexaRequest.vRes = { instruction: instruction};

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Wiederholen (alexaRequest) {
		let step = alexaRequest.getPermanent('step');
		let index = alexaRequest.getPermanent('index');
		let column = `step${step}`;
		// let columnDur = `dur${step}`
		let instruction = alexaRequest.dataBase[index][column];
		// let stepDuration = alexaRequest.dataBase[index][columnDur];
		alexaRequest.vRes = { instruction: instruction};

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Zurueck (alexaRequest) {
		let step = alexaRequest.getPermanent('step') - 1 ;
		let index = alexaRequest.getPermanent('index');
		alexaRequest.savePermanent('step', step);

		let column = `step${step}`;
		// let columnDur = `dur${step}`
		let instruction = alexaRequest.dataBase[index][column];
		// let stepDuration = alexaRequest.dataBase[index][columnDur];
		console.log(instruction);
		alexaRequest.vRes = { instruction: instruction};

		return new Promise( resolve => resolve( alexaRequest ) );
	}
}

module.exports = Execution;
