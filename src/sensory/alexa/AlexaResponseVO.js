/**
 * Created by sashthecash on 08/06/2017.
 */

class AlexaResponseVO {

	static getResponse ( text, sessionEnd = true, sessionData = null ) {
		let res =
				    {
					    version  : '1.0',
					    response : {
						    outputSpeech     : {
							    type : 'SSML',
							    ssml : '<speak>' + text + '</speak>'
						    },
						    shouldEndSession : sessionEnd
					    },
				    };

		// add Session Attributes
		res.sessionAttributes = sessionData;
		return res;
	}

}

module.exports = AlexaResponseVO;
