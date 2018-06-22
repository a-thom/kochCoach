/**
 * Created by sashthecash on 08/06/2017.
 */

class AlexaResponseVO {
  static getResponse (text, sessionEnd = true, sessionData = null, card = null) {
  	let title = card.title;
  	console.log('title: ' + card.title)
    let res =
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
    if(typeof title === 'string'){
  		//console.log('in');
    	res.response.card = {
				type: "Standard", // Simple, Standard, LinkAccount
				title: card.title,
				text: card.content,
				"image": {
				  "smallImageUrl": card.image,
				  "largeImageUrl": card.image
				}
			}
    }
		// add Session Attributes
		res.sessionAttributes = sessionData
		console.log('res: ' + JSON.stringify(res));

		return res;
  }
}

module.exports = AlexaResponseVO;
