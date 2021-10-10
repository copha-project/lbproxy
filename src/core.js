const Config = require('./config')
const path = require('path')
const { daemon, debug } = require('./common')
const Balancer = require('./balancer')
const Proxy = require('./proxy')

class Core {
    static config = new Config()
	
    constructor(){
    }
	
    get config(){
	return Core.config
    }
	
    async renewProxy(){
        const failedList = await this.connectTest('https://www.baidu.com')
        console.log(failedList.map(e=>e.toString()))
    }

    async connectTest(testUrl){
        const list = this.listProxy()
        const func = async (list) => {
            const failedList = []
            for (const item of list) {
                const proxy = new Proxy(item)
                try {
                    const resp = await proxy.connect(testUrl)
                    if(parseInt(resp.statusCode) !== 200) failedList.push(proxy)
                } catch (error) {
                    failedList.push(proxy)
                }
            }
            return failedList
        }
        let failedList = []
        for (let index = 0; index < 3; index++) {
            failedList = await func(index ? failedList : list) 
        }
        return failedList
    }

    getProxy(){
        const proxies = this.listProxy()
        if(proxies.length==0){
            throw Error('proxy pool not has proxy.')
        }
        // todo 添加获取代理的策略
        return proxies[0]
    }

    listProxy(){
        return this.config.proxies
    }

    findProxy(proxy){
        return this.config.proxies.findIndex(e=>{
            return e.host === proxy.host && e.port === parseInt(proxy.port)
        })
    }

    addProxy(data){
        const [host,port] = data.split(':')
        if(!host || !port) throw Error('format error')
	const proxy = new Proxy()
        proxy.host = host
        proxy.port = parseInt(port)
        if(this.findProxy(proxy) >= 0) return
        return this.config.addProxy(proxy)
    }

    delProxy(data){
        const [host,port] = data.split(':')
        const proxy = new Proxy()
        proxy.host = host
        proxy.port = parseInt(port)
        return this.config.delProxy(proxy)
    }

    delProxies(){
        return this.config.delProxies()
    }

    async daemon(options){
        const Entry = "index"
        const execPath = path.resolve(__dirname,`../bin/${Entry}.js`)
        const args = ['--host',options.host,'--port',options.port,'--method',options.method || Balancer.DefaultMethodName]
        return daemon(execPath,args,{LBPROXY_DAEMON:1,DEBUG:'none'})
    }
}

module.exports = Core
module.exports.getProxy = ()=>{
    const core = new Core()
    return core.getProxy()
}
