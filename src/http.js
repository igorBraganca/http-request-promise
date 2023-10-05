class Http {

    constructor() {
        this._https = require('https')
        this._http = require('http')
    }

    get(url, headers = {}) {
        const options = {
            method: 'GET',
            headers: {
                ...headers
            }
        }
        return this._doRequest(url, options)
    }

    post(url, body, headers = {}) {
        const options = {
            method: 'POST',
            headers: {
                ...headers
            }
        }
        return this._doRequest(url, options, body)
    }

    _doRequest(url, options, body) {
        const _body = typeof body === 'object' ? JSON.stringify(body) : body;
        const _bodySize = _body ? _body.length : 0;

        options.headers = options.headers || {}
        options.headers['Content-Length'] = _bodySize

        return new Promise((resolve, reject) => {
            const protocol = this._getProtocol(url);
            const req = this[`_${protocol}`].request(url, options, (incomingMessage) => {
                const response = {
                    statusCode: incomingMessage.statusCode,
                    headers: incomingMessage.headers,
                    body: []
                };

                const contentType = response.headers['Content-Type'] || response.headers['content-type']
                const charset = this._getCharset(contentType)
                incomingMessage.setEncoding(charset)

                incomingMessage.on('data', (chunk) => {
                    response.body.push(chunk);
                });

                incomingMessage.on('end', () => {
                    if (!contentType) {
                        reject(`Http._doRequest :: Content-Type not defined. Headers: ${JSON.stringify(response.headers)}`)
                        return;
                    }

                    if (contentType.includes('application/json')) {
                        if (response.body.length) {
                            response.body = response.body.join('');
                            // require('fs').writeFileSync('b.json', response.body)
                            try {
                                response.body = JSON.parse(response.body);
                            } catch (e) {
                                reject(`Http._doRequest :: Fail to parse json response - ${e.message}`)
                            }
                        }
                        resolve(response);
                        return;
                    }

                    if (contentType.includes('text')) {
                        response.body = response.body.join('');
                        resolve(response);
                        return;
                    }

                    reject(`Http._doRequest :: Unsupported Content-Type ${JSON.stringify(contentType)}`)
                    return;
                });
            })

            req.on('error', (e) => {
                reject(`Http._doRequest :: Request fail - ${e.message}`)
            });

            if (_body) {
                req.write(_body);
            }

            req.end();
        })
    }

    /**
     * 
     * @param {string} url 
     * @returns 
     */
    _getProtocol(url) {
        const re = /^(.*):\/\/.*/
        const matches = url.match(re)

        if (!matches || matches.length === 0) {
            throw new Error(`Http._getProtocol :: Protocol not found - ${url}`)
        }

        if (!['http', 'https'].includes(matches[1])) {
            throw new Error(`Http._getProtocol :: Protocol not supported - ${matches[1]}`)
        }

        return matches[1]
    }

    _getCharset(txt) {
        const re = /charset=([^()<>@,;:\"/[\]?.=\s]*)/i;
        return re.test(txt) ? re.exec(txt)[1] : 'utf8';
    }
}

exports.Http = Http