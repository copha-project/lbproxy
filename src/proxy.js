const url = require('url')
const https = require('https')
const SocksProxyAgent = require('socks-proxy-agent')
const { debug } = require('./common')
const Config = require('./config')

class Proxy {
    type = 5
    host = ""
    port = 1080
    active = true
    rt = -1

    constructor(obj){
        if(obj instanceof Proxy) return obj
        obj && Object.assign(this, obj)
        this.config = Config.getInstance()
    }

    async connect(endpoint){
        return new Promise((resolve,reject)=>{
            const proxy = `socks://${this.host}:${this.port}`
            // debug('attempting to GET %j', endpoint)
            const opts = url.parse(endpoint)
            opts.timeout = 5000
            opts.agent = new SocksProxyAgent(proxy)
            const bt = new Date()
            https.get(opts, (res) => {
                this.rt = (new Date() - bt)/1000
                resolve(res)
            }).on('error',reject)
        })
    }

    setDown(){
        if(!this.active) return
        this.active = false
        this.config.updateProxy(this.toJson())
    }

    setUp(){
        if(this.active) return
        this.active = true
        this.config.updateProxy(this.toJson())
    }

    toString(){
        return `socks${this.type}@${this.host}:${this.port} ${this.active}`
    }

    toJson() {
        return {
            type: this.type,
            host: this.host,
            port: this.port,
            active: this.active,
            rt: this.rt
        }
    }    
}

module.exports = Proxy