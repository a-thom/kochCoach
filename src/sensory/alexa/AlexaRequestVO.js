/**
 * Created by sashthecash on 28/04/2017.
 */


const
		objectPath = require( 'object-path' ),
		crypto     = require( 'crypto' );

class AlexaRequestVO {

	constructor ( rawData ) {

		this._rawData = rawData;

		this._sessionData = {};

		this._dataBase = null;

		this._shouldEndSession = true;

		this._locale = objectPath.get( rawData, 'request.locale' );

		this._requestType = objectPath.get( rawData, 'request.type' );

		this._intentName = objectPath.get( this._rawData, 'request.intent.name' ) || this._requestType;
		this._intentName = this._intentName.replace( 'AMAZON.', '' );

		let deviceID   = objectPath.get( rawData, 'context.System.device.deviceId' ) || 'noDevice';
		this._deviceID = crypto.createHash( 'md5' ).update( deviceID ).digest( 'hex' );

		let sessionID   = objectPath.get( rawData, 'session.sessionId' ) || 'noSession';
		this._sessionID = crypto.createHash( 'md5' ).update( sessionID ).digest( 'hex' );

		let userId   = objectPath.get( this._rawData, 'session.user.userId' ) || 'noUserID';
		this._userId = crypto.createHash( 'md5' ).update( userId ).digest( 'hex' );

		this._reqSessionData = objectPath.get( this._rawData, 'session.attributes' ) || {};

		// parse Slots to object.
		let slots   = objectPath.get( rawData, 'request.intent.slots' );
		this._slots = {};
		for ( let slot in slots ) { this._slots[ slot ] = slots[ slot ];}

		// // get resolution for slot
		// let slotResolution;
		// this._slotResolution = {};
		// for ( let slot in slots ) { this._slotResolution[ slot ] = slots[ slot ].resolutions.resolutionsPerAuthority[0].values[0].value.name;}

		this._vReq     = {};
		this._vRes     = {};
		this._vResLoop = [];

		this._recipeIndex = null;

		/*
		console.log( '---------------------' );
		console.log( JSON.stringify( objectPath.get( rawData, 'request' ), null, 4 ) );
		console.log( JSON.stringify( this._reqSessionData, null, 4 ) );
		console.log( '---------------------' );
		*/
	}

	set vReq ( val ) {
		this._vReq = val;
	}

	set vRes ( val ) {
		this._vRes = val;
	}

	set vResLoop ( val ) {
		this._vResLoop = val;
	}

	set skillData ( val ) {
		this._skillData = val;
	}

	set dataBase ( val) {
		this._dataBase = val;
	}

	set answer ( val ) {
		this._answer = val;
	}

	set shouldEndSession ( val ) {
		this._shouldEndSession = val;
	}

	set repromptText ( val ) {
		this._repromptText = val;
	}

	set intentName ( val ) {
		this._intentName = val;
	}

	set sessionData ( val ) {
		this._sessionData = val;
	}

	set recipeIndex ( val ) {
		this._recipeIndex = val;
	}

	get shouldEndSession () { return this._shouldEndSession }

	get reqSessionData () { return this._reqSessionData }

	get vReq () { return this._vReq; }

	get sessionData () { return this._sessionData; }

	get dataBase () { return this._dataBase; }

	get vRes () { return this._vRes; }

	get vResLoop () { return this._vResLoop; }

	get skillData () { return this._skillData; }

	get local () { return this._locale; }

	get answer () { return this._answer; }

	get deviceId () { return this._deviceID; }

	get userId () { return this._userId; }

	get sessionId () { return this._sessionID; }

	get slots () { return this._slots; }

	// get slotResolution () {return this._slotResolution}

	get answer () { return this._answer; }

	get requestType () { return this._requestType;}

	get intentName () {return this._intentName;}

	get recipeIndex () {return this._recipeIndex;}

}

module.exports = AlexaRequestVO;
