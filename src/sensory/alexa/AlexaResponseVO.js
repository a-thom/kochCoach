/**
 * Created by sashthecash on 08/06/2017.
 */

class AlexaResponseVO {
  static getResponse (text, sessionEnd = true, sessionData = null, cardTitle = null, cardContent = null) {
    console.log(cardContent);
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
							type: "Simple", // Simple, Standard, LinkAccount
							title: cardTitle,
							content: cardContent,
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
