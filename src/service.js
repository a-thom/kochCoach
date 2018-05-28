const
  http = require('http'),
  Skill = require('./skill'),
  port = 8080

/** Test Class to use Lambda Service over http – local test
 start your ngrok service with
 $ ngrok http 8080 --region eu
 first! 🤓 */

class HTTPTestService {
  constructor () {
    console.log('🙌 Create Test HTTP Service on http://localhost:' + port)
    http.createServer((req, res) => {
      if (req.method === 'POST') {
        let jsonString = ''
        req.on('data', (data) => { jsonString += data })
        req.on('end', () => {
          Skill.handler(JSON.parse(jsonString), null,
            (err, response) => {
              if (err) {
                res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'})
                res.end(JSON.stringify({error: err}))
              }
              res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'})
              res.end(JSON.stringify(response))
            })

        })
      } else {
        res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'})
        res.end(JSON.stringify({error: '😩 alexa service requires post data'}))
      }
    }).listen(port)
  }
}

new HTTPTestService()
