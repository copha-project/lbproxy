#!/usr/bin/env node
if(process.env.NODE_ENV === 'development') {
    console.log('----! works in development mode !----')
}
const lbproxy = require(process.env.NODE_ENV !== 'development' ? '../src/' : '../dist/')
lbproxy.createServer()