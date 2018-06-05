/**
 * Created by sashthecash on 21/06/2017.
 */

const
		AlexaComplexAnswer = require( './sensory/alexa/AlexaComplexAnswer' );

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
	static Start (alexaRequest) {

		let slotObject = {};
		slotObject = alexaRequest.slots;
		let slots = {};
		for ( let slot in slotObject ) {
			slots[ slot ] = slotObject[ slot ];
		}
		let recipe = {};
		for ( let slot in slots ) {
			//TODO: Fehlermeldung, wenn kein Slot mitgegeben
			recipe[ slot ] = slots[ slot ].resolutions.resolutionsPerAuthority[0].values[0].value.name;
		}

		//console.log('recipe: ' + JSON.stringify(recipe.rezepte));

		let names = [];
		for(let i = 0; i < alexaRequest.dataBase.length; i++){
			names [i] = alexaRequest.dataBase[i].name;
		}

		let index = names.indexOf(recipe.rezepte);
		if(index >= 0){
			alexaRequest.vRes = { reply : 'Okay. Ich starte das Rezept ' + alexaRequest.dataBase[index].name};
		} else {
			alexaRequest.vRes = { reply : 'dieses Rezept habe ich leider nicht gefunden.'};
			//TODO warum kommt er hier garnicht hin sondern geht in anderen intent?
		}

		return new Promise( resolve => resolve( alexaRequest ) );
	}



}

module.exports = Execution;
