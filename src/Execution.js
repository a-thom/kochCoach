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

	static LaunchRequest (alexaRequest) {
		return new Promise( resolve => resolve( alexaRequest ) );
	}

	static Inspiration (alexaRequest) {
		let randomSelection = Math.floor(Math.random() * alexaRequest.dataBase.length);
		alexaRequest.savePermanent('index', randomSelection);
		alexaRequest.savePermanent('step', 0);
		alexaRequest.vRes = { suggestion : alexaRequest.dataBase[randomSelection].name};

		return new Promise( resolve => resolve( alexaRequest ) );
  }
  
	static Rezept (alexaRequest) {
		console.log("index: " + index)
		let index = alexaRequest.getPermanent('index');
		let recipeName = alexaRequest.dataBase[index].name;
    let recipeDuration = alexaRequest.dataBase[index].time;

		alexaRequest.vRes = { name : recipeName, duration: recipeDuration};

		return new Promise( resolve => resolve( alexaRequest ) );
	}

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

	static Kochen (alexaRequest) {
		let step = alexaRequest.getPermanent('step') ;
		let index = alexaRequest.getPermanent('index');
		let recipeName = alexaRequest.dataBase[index].name;
		let recipeDuration = alexaRequest.dataBase[index].time;
		alexaRequest.vRes = { name : recipeName, duration: recipeDuration};

		return new Promise( resolve => resolve( alexaRequest ) );
	}

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

    //TODO: will man hier mit einem nicht complexAnswer mode antworten?
    alexaRequest.vRes = { instruction: instruction};

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	static Zurueck (alexaRequest) {
		let step = alexaRequest.getPermanent('step') - 1 ;
		let index = alexaRequest.getPermanent('index');
		alexaRequest.savePermanent('step', step);

		let column = `step${step}`;
		// let columnDur = `dur${step}`
		let instruction = alexaRequest.dataBase[index][column];
		// let stepDuration = alexaRequest.dataBase[index][columnDur];
		alexaRequest.vRes = { instruction: instruction};

		return new Promise( resolve => resolve( alexaRequest ) );
	}

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
}

module.exports = Execution;
