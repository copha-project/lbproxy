const {debug} = require('./common')
const path = require('path')
const fs = require('fs')
const Utils = require('uni-utils')
const writeFileAtomic = require('write-file-atomic')
const dotProp = require('dot-prop')

const configDirectory = path.join(Utils.homedir(),'.config/lbproxy')
const mkdirOptions = {mode: 0o0700, recursive: true}
const writeFileOptions = {mode: 0o0600}

const CONFIG_PROXY = "proxies"
const CONFIG_CONNECT_TEST_URL = "CONNECT_TEST_URL"
const RENEW_LAST_TEST_DATE = "RENEW_LAST_TEST_DATE"
const RENEW_TIME_GAP = "RENEW_TIME_GAP"
const CONFIG_PID = 'pid'
const CONFIG_REQ_TIMEOUT = 'REQ_TIMEOUT'

const DefaultConfig = {
    [CONFIG_PROXY]: [],
	[CONFIG_PID]: 0,
	[CONFIG_CONNECT_TEST_URL]: "https://github.com",
	[RENEW_LAST_TEST_DATE]: 0,
	[RENEW_TIME_GAP]: 300,
	[CONFIG_REQ_TIMEOUT]: 300000
}

class Config {
	static #instance = null
    #configPath = path.join(configDirectory,'config.json')
    constructor(){}
	
	static getInstance(){
        if(!this.#instance){
			debug('new config instance')
            this.#instance = new this
			this.#instance.all = {
				...DefaultConfig,
				...this.#instance.all
			}
        }else{
			debug('reuse config')
		}
        return this.#instance
    }

    get all(){
        try {
			return Utils.readJsonSync(this.#configPath)
		} catch (error) {
			// Create directory if it doesn't exist
			if (error.code === 'ENOENT') {
				return {}
			}
			// Improve the message of permission errors
			if (error.code === 'EACCES') {
				error.message = `${error.message}\n${permissionError}\n`;
			}

			// Empty the file if it encounters invalid JSON
			if (error.name === 'SyntaxError') {
				writeFileAtomic.sync(this.#configPath, '', writeFileOptions)
				return {}
			}

			throw error
		}
    }

    set all(value){
        try {
			// Make sure the folder exists as it could have been deleted in the meantime
			fs.mkdirSync(path.dirname(this.#configPath), mkdirOptions)

			writeFileAtomic.sync(this.#configPath, JSON.stringify(value, undefined, '\t'), writeFileOptions);
		} catch (error) {
			// Improve the message of permission errors
			if (error.code === 'EACCES') {
				error.message = `${error.message}\n${permissionError}\n`
			}
			throw error
		}
    }

    get(key) {
		return dotProp.get(this.all, key)
	}

	set(key, value) {
		const config = this.all
		dotProp.set(config, key, value)
		this.all = config
	}

    get proxies(){
        return this.get(CONFIG_PROXY) || []
    }

	get connectTestUrl(){
		return this.get(CONFIG_CONNECT_TEST_URL)
	}

	get renewGap() {
		return this.get(RENEW_TIME_GAP)
	}

	get renewLastTime(){
		return this.get(RENEW_LAST_TEST_DATE)
	}
	
	get reqTimeOut(){
		return this.get(CONFIG_REQ_TIMEOUT)
	}

	set renewLastTime(v){
		return this.set(RENEW_LAST_TEST_DATE,v)
	}

    addProxy(proxy){
		const proxies = this.proxies
		proxies.push(proxy)
        this.set(CONFIG_PROXY,proxies)
    }

    delProxy(proxy){
        this.set(CONFIG_PROXY,this.proxies.filter(e=>
			!(e.host === proxy.host && e.port === proxy.port)
		))
    }

	delProxies(){
		this.set(CONFIG_PROXY,[])
	}

	updateProxy(proxy){
		this.delProxy(proxy)
		this.addProxy(proxy)
	}
}

module.exports = Config