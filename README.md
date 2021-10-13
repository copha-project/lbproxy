# lbproxy
[![npm version](https://badge.fury.io/js/@copha%2Flbproxy.svg)](https://badge.fury.io/js/@copha%2Flbproxy)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

A proxy server with load balance

> now support socks5 only

## Install
```
npm i -g @copha/lbproxy 
# yarn global add @copha/lbproxy
```

## How to use

* Add socks5 config to proxy pool
```
lbproxy -a host:port
```

- Renew proxy pools
```
lbproxy -r [test_url]
```

- Start proxy service
```
lbproxy -H 127.0.0.1 -p 1080 -r 5 -m R # use -D option can run server with daemon mode
```

- Stop proxy service
```
lbproxy -s
```

-  Use `lbproxy -h` for more helper

## Load Balance Strategy
default use random

- [x] Random (R)
- [x] Round Robin (RR)
- [ ] Least connections (LC)
- [x] The least response time (LRT)

### Ref
* [simple-socks](https://github.com/brozeph/simple-socks)
