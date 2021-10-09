const url = require('url')
const https = require('https')
const SocksProxyAgent = require('socks-proxy-agent')
const { debug } = require('./common')

class Proxy {
    type = 5
    host = ""
    port = 1080

    constructor(obj){
        this.host = obj?.host
        this.port = obj?.port
        this.type = obj?.type
    }

    async connect(endpoint){
        return new Promise((resolve,reject)=>{
            const proxy = `socks://${this.host}:${this.port}`
            // debug('attempting to GET %j', endpoint)
            const opts = url.parse(endpoint)
            opts.timeout = 5000
            opts.agent = new SocksProxyAgent(proxy)
            https.get(opts, function (res) {
                resolve(res)
            }).on('error',reject)
        })
    }
    toString(){
        return `socks${this.type}@${this.host}:${this.port}`
    }
}

module.exports = Proxy