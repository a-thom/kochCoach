/**
 * Created by sashthecash on 08/06/2017.
 */

class AlexaResponseVO {
  static getResponse (text, sessionEnd = true, sessionData = null) {
    let res =
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
            title: "string",
            content: "string",
            // "image": {
            //   "smallImageUrl": "https://carfu.com/resources/card-images/race-car-small.png",
            //   "largeImageUrl": "https://carfu.com/resources/card-images/race-car-large.png"
            // }
          },
  
          // directives: [
          //   {
          //     type: 'Display.RenderTemplate',
          //     template: {
          //       type: 'BodyTemplate2',
          //       token: 'jaujau',
          //       title: 'Did You Know?',
          //       backgroundImage: {
          //         contentDescription: 'Textured grey background',
          //         sources: [{url: 'https://s3.amazonaws.com/hurricane-data/hurricaneBackground.png'}],
          //       },
          //       textContent: {
          //         primaryText: {
          //           type: 'RichText',
          //           text: 'The worlds stinkiest cheese is from Northern France'
          //         }
          //       }
          //     }
          //   },
          //   {
          //     type: 'Hint',
          //     hint: {
          //       type: 'PlainText',
          //       text: 'string'
          //     }
          //   }
          // ]
  
        },
        shouldEndSession: sessionEnd
      }
    // add Session Attributes
    res.sessionAttributes = sessionData
    return res
  }
}

module.exports = AlexaResponseVO;
