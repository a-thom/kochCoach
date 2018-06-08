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
	static Inspiration (alexaRequest) {

		alexaRequest.vRes = { suggestion : alexaRequest.dataBase[Math.floor(Math.random() * alexaRequest.dataBase.length)].name};

		return new Promise( resolve => resolve( alexaRequest ) );
  }
  
  /**  @param {AlexaRequestVO} alexaRequestVO */
	static Rezept (alexaRequest) {

    let index = alexaRequest.recipeIndex;
		let recipeName = alexaRequest.dataBase[index].name;
    let recipeDuration = alexaRequest.dataBase[index].time;
    
		alexaRequest.vRes = { name : recipeName, duration: recipeDuration};

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Start (alexaRequest) {

		let slotObject = {};
		slotObject = alexaRequest.slots;
		let slots = {};
		for ( let slot in slotObject ) {
			slots[ slot ] = slotObject[ slot ];
		}
		let recipe = {};

      recipe = objectPath.get(slots, `rezepte.resolutions.resolutionsPerAuthority.0.values.0.value.name`);
      console.log('recipe: ' + recipe);

		let names = [];
		for(let i = 0; i < alexaRequest.dataBase.length; i++){
			names [i] = alexaRequest.dataBase[i].name;
		}

		let index = names.indexOf(recipe);
		if(index >= 0){
      alexaRequest.savePermanent('index', index);
      alexaRequest.savePermanent('step', 0);
			alexaRequest.vRes = { reply : 'Okay. Ich starte das Rezept ' + alexaRequest.dataBase[index].name};
		} else {
      alexaRequest.intentName = 'NoRecipe' 
			//alexaRequest.vRes = { reply : 'dieses Rezept habe ich leider nicht gefunden.'};
		}
    // TODO: rufe von hier aus Rezept intent auf
    

		return new Promise( resolve => resolve( alexaRequest ) );
	}

	/**  @param {AlexaRequestVO} alexaRequestVO */
	static Kochen (alexaRequest) {

		let index = alexaRequest.recipeIndex;
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
    console.log(step,index,column);
    let instruction = alexaRequest.dataBase[index][column];
    
    alexaRequest.vRes = { instruction: instruction};

		return new Promise( resolve => resolve( alexaRequest ) );
	}
}

module.exports = Execution;
