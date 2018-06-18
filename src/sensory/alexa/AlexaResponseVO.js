/**
 * Created by sashthecash on 08/06/2017.
 */

class AlexaResponseVO {
  static getResponse (text, sessionEnd = true, sessionData = null, cardTitle = null, cardContent = null) {
  	console.log('sessionData: ' + sessionData);
    console.log('sessionEnd: ' + sessionEnd);
    let res;
    if(cardContent == null){
			res =
				{
					version: '1.0',
					sessionAttributes: {},
					response: {
						outputSpeech: {
							type: 'SSML',
							ssml: `<speak>${text}</speak>`
						},
					},
					shouldEndSession: sessionEnd
				}
    } else {
			res =
				{
					version: '1.0',
					sessionAttributes: {},
					response: {
						outputSpeech: {
							type: 'SSML',
							ssml: `<speak>${text}</speak>`
						},

						card : {
							type: "Standard", // Simple, Standard, LinkAccount
							title: cardTitle,
							text: cardContent,
							// "image": {
							//   "smallImageUrl": "https://carfu.com/resources/card-images/race-car-small.png",
							//   "largeImageUrl": "https://carfu.com/resources/card-images/race-car-large.png"
							// }
						},
					},
					shouldEndSession: sessionEnd
				}
    }
		// add Session Attributes
		res.sessionAttributes = sessionData
    return res;
  }
}

module.exports = AlexaResponseVO;
