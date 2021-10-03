#!/usr/bin/env node
if(process.env['LBPROXY_DAEMON']) {
    delete process.env['DEBUG']
}
require('../dist/cli')()