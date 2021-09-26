const {debug} = require('./common')
const Config = require('./config')

class Core {
    constructor(){
        this.config = new Config()
    }
    listProxy(){
        return this.config.proxys
    }
    addProxy(proxy){
        return this.config.addProxy(proxy)
    }
    delProxy(proxy){
        return this.config.delProxy(proxy)
    }
}

module.exports = Core