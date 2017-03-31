# queryp
a nodejs package for process query

# usage
```
queryp( filter, callback )

example:
queryp({command:"chrome"}, (err, procs)=>{
        if( err ){
            console.error(err)
            return
        }
        procs.forEach((proc)=>{
            console.log( `${proc.pid} ${proc.command}` )
        })
})
```
### filter 
```
filter of queryp only support four field for filtering:
pid/ppid/command/cmd
you could specify filter like 
{
    pid : 123
} 
to find all processes with pid that match /123/
or 
{
    cmd : "node.*_mocha"
}
to find all processes with command line that match /node.*_mocha/
or
{
    ppid : 123
}
to find all processes with ppid that match /123/, which means it may also return processes with ppid 1234, but you could use array.filter to filter that out

it should noted that the filter support nodejs regex
```

### return procs
```
Each item of procs should contain four keys:
```
<ul>
<li>pid : pid of process</li>
<li>pid : parent pid of process</li>
<li>command : command name of process,for example, node</li>
<li>cmd : command line of process, for example, node index.js</li>
</ul>

# Attention
```
if you run queryp in linux, what you may get like cmd could be truncate, I will try to fix this later
```

