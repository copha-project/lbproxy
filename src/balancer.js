const Config = require('./config')
const {debug} = require('./common')

const LB_METHODS = {
    "R": {
        name: "Random",
        active: true,
        func:(list,lastIndex)=>{
            const getRandomInt = function(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            return getRandomInt(0,list.length-1)
        }
    },
    "RR": {
        name: "Round Robin",
        active: true,
        func: (list,lastIndex)=>{
            return (lastIndex+1) % list.length
        }
    },
    "LC": {
        name: "Least connections",
        active: false
    },
    "LRT": {
        name: "The least response time",
        active: false
    }
}

const DefaultMethodName = "R"
class Balancer {
    static #instance = null
    static Methods = LB_METHODS
    static DefaultMethodName = DefaultMethodName
    static methodNameList = Object.keys(LB_METHODS)

    constructor(){
        this.config = new Config()
        this.proxies = this.config.proxies
        this.currentProxyIndex = 0
    }

    static getProxy(){
        return this.getInstance().getProxy()
    }

    static getInstance(){
        if(!this.#instance){
            this.#instance = new this
        }
        return this.#instance
    }

    setMethod(name=DefaultMethodName){
        this.useMethod = LB_METHODS[name]
        if(!this.useMethod.active) throw Error('This method is currently unavailable.')
        debug(`lb method use [${this.useMethod.name}]`)
    }

    getProxy(){
        let index = this.useMethod.func(this.proxies,this.currentProxyIndex)
        this.currentProxyIndex = index
        return this.proxies[index]    
    }
}

module.exports = Balancer