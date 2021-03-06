const Config = require('./config')
const {debug, loopFunc} = require('./common')
const Core = require('./core')

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
        active: true,
        func: (list) => {
            let minRt = 100
            let index = -1
            for (const i in list) {
                if(list[i].rt > 0 && list[i].rt < minRt){
                    minRt = list[i].rt
                    index = i
                }
            }
            return index
            // return list.sort((a,b)=>a.rt-b.rt).filter(e=>e.rt>0)[0]
        }
    }
}

const DefaultMethodName = "R"
class Balancer {
    static #instance = null
    static Methods = LB_METHODS
    static DefaultMethodName = DefaultMethodName
    static methodNameList = Object.keys(LB_METHODS)

    constructor(){
        this.config = Config.getInstance()
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
        if(name === 'LRT'){
            debug(`renew proxy every ${this.config.renewGap} seconds`)       
            loopFunc(()=>{
                Core.getInstance().renewProxy()
                debug(`next renew at ${new Date(new Date().getTime()+ this.config.renewGap * 1000).toTimeString()}`)
            },this.config.renewGap*1000)
        }
    }

    getProxy(){
        const activeList = this.proxies.filter(e=>e.active)
        let index = this.useMethod.func(activeList,this.currentProxyIndex)
        if(index == -1) {
            throw Error('No suitable proxy was found to use!')
        }
        this.currentProxyIndex = index
        return activeList[index] 
    }
}

exports.DefaultMethodName = DefaultMethodName
exports.getInstance = ()=>Balancer.getInstance()
exports.methodNameList = Balancer.methodNameList