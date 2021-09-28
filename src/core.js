const {debug} = require('./common')
const Config = require('./config')

class Core {
    constructor(){
        this.config = new Config()
    }

    listProxy(){
        return this.config.proxys
    }

    findProxy(proxy){
        return this.config.proxys.findIndex(e=>{
            return e.host === proxy.host && e.port === parseInt(proxy.port)
        })
    }

    addProxy(data){
        const [host,port] = data.split(':')
        if(!host || !port) throw Error('format error')
        const proxy = {
            type: 5,
            host,
            port: parseInt(port)
        }
        if(this.findProxy(proxy) >= 0) return
        return this.config.addProxy(proxy)
    }

    delProxy(data){
        const [host,port] = data.split(':')
        const proxy = {
            type: 5,
            host,
            port
        }
        return this.config.delProxy(proxy)
    }

    delProxys(){
        return this.config.delProxys()
    }
}

module.exports = Core