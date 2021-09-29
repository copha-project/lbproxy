const {debug} = require('./common')
const path = require('path')
const os = require('os')
const fs = require('fs')
const Utils = require('uni-utils')
const writeFileAtomic = require('write-file-atomic')
const dotProp = require('dot-prop')

const configDirectory = path.join(Utils.homedir(),'.config/lbproxy')
const mkdirOptions = {mode: 0o0700, recursive: true}
const writeFileOptions = {mode: 0o0600}

const DefaultConfig = {
    proxy: [],
    pid: 0
}

const CONFIG_PROXY = "proxy"

class Config{
    #configPath = path.join(configDirectory,'config.json')
    constructor(){
        this.all = {
            ...DefaultConfig,
            ...this.all
        }
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

    get proxys(){
        return this.get(CONFIG_PROXY)
    }

    addProxy(proxy){
		const proxys = Array.isArray(this.proxys) ? this.proxys : []
		proxys.push(proxy)
        this.set(CONFIG_PROXY,proxys)
    }

    delProxy(proxy){
        this.set(CONFIG_PROXY,this.proxys.filter(e=>
			!(e.host === proxy.host && e.port === proxy.port)
		))
    }
	
	delProxys(){
		this.set(CONFIG_PROXY,[])
	}
}

module.exports = Config