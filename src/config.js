const {debug} = require('./common')
const Configstore =  require('configstore')

const DefaultConfig = {
    proxy: []
}

const CONFIG_PROXY = "proxy"

class Config{
    #config = new Configstore('lbproxy', DefaultConfig)
    constructor(){

    }
    get proxys(){
        return this.#config.get(CONFIG_PROXY)
    }
    addProxy(proxy){
        this.#config.set(CONFIG_PROXY,this.proxys.push(proxy))
    }
    delProxy(proxy){
        this.#config.set(CONFIG_PROXY,this.proxys.splice(this.proxys.indexOf(proxy), 1))
    }
}

module.exports = Config