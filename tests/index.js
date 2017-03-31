const {queryp} = require('../lib/queryproc')
const {spawn} = require('child_process')
const expect = require('chai').expect
const pid = (process.pid).toString()
describe('process query', ()=>{
    describe('pid matchinig', ()=>{
        it('pid matching succeeds',(done)=>{
            return queryp({pid : pid}, (err, procs)=>{
                if( err ){
                    done(err)
                    //expect(false).to.be.equal(true)
                    return
                }
                if( procs === null || procs.length === 0 ){
                    done(new Error('find nothing'))
                }
                const findProc = procs[0].pid === pid
                console.info( `pid : found ${procs[0].pid}, filter ${pid}` )
                if( findProc ){
                    done()
                }else{
                    done(new Error('pid no match'))
                }
            })
        })
    }),
    describe('command name match', (done)=>{
        it('command name matching succeeds',(done)=>{
            let comm = 'node.exe'
            if( process.platform !== 'win32' ){
                comm = 'node'
            }
            return queryp({command : comm, pid : pid}, (err, procs)=>{
                if( err ){
                    done(err)
                    //expect(false).to.be.equal(true)
                    return
                }
                if( procs === null || procs.length === 0 ){
                    done(new Error('find nothing'))
                }
                const findProc = procs[0].pid === pid && procs[0].command === comm
                console.info( `pid : found ${procs[0].pid}, filter ${pid}` )
                console.info( `comm : found ${procs[0].command}, filter ${comm}` )
                console.info( `cmd : found ${procs[0].cmd}` )
                if( findProc ){
                    done()
                }else{
                    done(new Error('pid no match'))
                }
            })
        })
    }),
    describe('command line match', (done)=>{
        it('command line matching succeeds',(done)=>{
            let commandLine = 'node.exe.*_mocha.*tests'
            let comm = 'node.exe'
            if( process.platform !== 'win32' ){
                comm = 'node'
                commandLine = 'node.*_mocha.*tests'
            }
            return queryp({cmd : commandLine, pid : pid}, (err, procs)=>{
                if( err ){
                    done(err)
                    //expect(false).to.be.equal(true)
                    return
                }
                if( procs === null || procs.length === 0 ){
                    done(new Error('find nothing'))
                }
                const regExp = new RegExp(commandLine)
                const findProc = procs[0].pid === pid && procs[0].command === comm && procs[0].cmd.match(regExp)
                console.info( `pid : found ${procs[0].pid}, filter ${pid}` )
                console.info( `comm : found ${procs[0].command}, filter ${comm}` )
                console.info( `cmd : found ${procs[0].cmd}, filter ${commandLine}` )
                if( findProc ){
                    done()
                }else{
                    done(new Error('pid no match'))
                }
            })
        })
    }),
    describe('ppid match', (done)=>{
        it('ppid matching succeeds',(done)=>{
            let comm = 'node.exe'
            if( process.platform !== 'win32' ){
                comm = 'node'
            }
            const child = spawn(comm, ['-e', 'setInterval(()=>{\
            },10000)'])
            const child2 = spawn(comm, ['-e', 'setInterval(()=>{\
            },10000)'])
            const pid1 = child.pid.toString()
            const pid2 = child2.pid.toString()
            return queryp({ppid : pid,command:comm}, (err, procs)=>{
                if( err ){
                    done(err)
                    //expect(false).to.be.equal(true)
                    return
                }
                if( procs === null || procs.length !== 2 ){
                    console.log( procs.length)
                    done(new Error('does not find expected processes'))
                    return
                }
                const findProc = (procs[0].ppid === pid && procs[1].ppid === pid) &&
                                    (
                                        procs[0].pid === pid1 && procs[1].pid === pid2 ||
                                        procs[1].pid === pid1 && procs[0].pid === pid2
                                    )
                console.info( `ppid : filter ${pid}` )
                console.info( `spawn pid : ${pid1} ${pid2}` )
                console.info( `found pid : ${procs[0].pid} ${procs[1].pid}` )
                console.info( JSON.stringify(procs) )
                child.kill('SIGKILL')
                child2.kill('SIGKILL')
                if( findProc ){
                    done()
                }else{
                    done(new Error('pid no match'))
                }
            })
        })
    })
})