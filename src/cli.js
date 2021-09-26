const pkg = require('../package')
const {debug} = require('./common')
const commander = require('commander')
const { commandResolver, showProxys } = require('./index')

function createCommander(program) {
    program.configureHelp({
      sortSubcommands: true,
      subcommandTerm: (cmd) => cmd.name()
    })

    program.name("lbproxy")

    program
        .version(pkg.version, '-v, --version', 'lbproxy version')
        .option('-H --host <host>',"declare server bind address, default: 127.0.0.1")
        .option('-p --port <port>',"declare server bind port, default: 1080")
        .option('-D --daemon', "run at daemon mode")
        .option('-a --add <proxy>',"add a new proxy config")
        .option('-d --remove <proxy></proxy>',"remove a existed proxy config")
        .option('--remove-all',"remove all proxy")
    
    program.command('list')
        .description('list proxy config')
        .action(showProxys)
}

async function main(){
    const program = new commander.Command()
    createCommander(program)
    const parseData = await program.parseAsync()
    const options = parseData.opts()
    return commandResolver(options)
}

module.exports = () => {
    main().catch(e=>{
        debug(e)
    })
}