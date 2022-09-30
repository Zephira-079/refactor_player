const readLine = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})
const fs = require('fs')

let folderName
function ReadLine() {
    return new Promise((resolved,rejected) => {
        readLine.question("folderName : ",(res) => {
            folderName = "./" + res + "/"
            resolved()
            readLine.close()
        })
    })
}

async function readLineWait() {
    await ReadLine()

    fs.readdir(folderName,(err,file) => {
        for(i of file){
            const stats = fs.statSync(folderName+i.trim())
            const fileSizeInBytes = stats.size
            const fileSizeInMegabytes = fileSizeInBytes / (1024*1024)
            fs.appendFile('./filesize.txt','\"'+ fileSizeInMegabytes + " : " + i.trim() + '\",\n', function(err){

            })

        }
    })
}
readLineWait()

