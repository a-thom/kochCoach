/**
 * Created by sashthecash on 31/05/2017.
 */


const
  config               = require( './config' ),
  AlexaInitialisation = require( './sensory/alexa/AlexaInitialisation' ),
  Execution            = require( './Execution' ),
  ComplexAnswer        = require( './sensory/alexa/AlexaComplexAnswer' ),
  AlexaRes             = require('./sensory/alexa/AlexaResponseVO'),
  AlexaReq             = require( './sensory/alexa/AlexaRequestVO' );

let i = 0;
let initData;

class Skill {

  /** @description: LAMBDA function receives alexa request with json data. **/
  static async handler ( event, context, callback ) {

    // create new AlexaRequest Instance.
    let alexaRequest = new AlexaReq( event );

    // rezepte nur am Anfang laden
    if(alexaRequest.dataBase == null){
      let rezepte = await AlexaInitialisation.loadSpreadSheetVUI(config.spreadSheetVui, 'rezepte');
      alexaRequest.dataBase = rezepte //member einer klasse muss nicht deklariert werden
    }

    /** if initData is there skip API Initialisation */
    let alexaMainChain =
      //   initData ?
      //   Promise.resolve(initData) :
      AlexaInitialisation.loadSpreadSheetVUI( config.spreadSheetVui);

    let voiceResponse;

    alexaMainChain
      .then( data => {
        //save initData to RAM
        //console.log(rezepte);
        initData               = data;
        alexaRequest.skillData = initData;
        return alexaRequest;
      } )
      .then( Execution.exec )
      .then( alexaRequest => {
      	//console.log('context: ' + context)
        voiceResponse = AlexaRes.getResponse( alexaRequest.answer,
          alexaRequest.shouldEndSession,
          Object.assign( {}, alexaRequest.sessionData, {
            request : ++i,
            context : context
          } ), alexaRequest.card
        );
        //console.log( '📺 ->', voiceResponse );
        callback( null, voiceResponse );
      } )
      .catch( ( err ) => {
        console.error( err );
        alexaRequest.intentName = 'Error';
        alexaRequest.vReq       = err;
        alexaRequest.answer     = ComplexAnswer.buildComplexAnwser( alexaRequest );
        console.log('cardTitle: '+ alexaRequest.cardTitle);
        voiceResponse           = AlexaRes.getResponse( alexaRequest.answer, alexaRequest.shouldEndSession, err, alexaRequest.card);
        callback( null, voiceResponse );
      } );

  }
}

module.exports = Skill;

/** Lambda context object ...
 http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 callbackWaitsForEmptyEventLoop: [Getter/Setter],
 done: [Function: done],
 succeed: [Function: succeed],
 fail: [Function: fail],
 logGroupName: '/aws/lambda/magineskill',
 logStreamName: '2017/06/08/[$LATEST]ab2876210a2b480b8991609779a1b8e3',
 functionName: 'magineskill',
 memoryLimitInMB: '128',
 functionVersion: '$LATEST',
 getRemainingTimeInMillis: [Function: getRemainingTimeInMillis],
 invokeid: 'd3b37c4a-4c71-11e7-b657-d59589d60a3d',
 awsRequestId: 'd3b37c4a-4c71-11e7-b657-d59589d60a3d',
 invokedFunctionArn: 'arn:aws:lambda:eu-west-1:145805548107:function:magineskill'
 */
