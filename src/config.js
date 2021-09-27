const {debug} = require('./common')
const path = require('path')
const os = require('os')
const fs = require('fs')
const Utils = require('uni-utils')


const DefaultConfig = {
    proxy: []
}

const CONFIG_PROXY = "proxy"

class Config{
    #config = null
    constructor(){

    }
    get proxys(){
        if(!this.#config){
            const ConfigStore = await import("configStore")
            this.#config = new Configstore('lbproxy', DefaultConfig)
        }
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