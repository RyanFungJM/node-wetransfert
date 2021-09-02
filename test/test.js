process.env.DEBUG = "wetransfert*"
const { getInfo, isValidWetransfertUrl, download, downloadPipe ,upload, waitForDownloadable, Payload } = require('../index')
const fs = require('fs')
const path = require('path')

const testSamples = [
    path.resolve(__dirname, './ressources/flower-3876195_960_720.jpg'),
    path.resolve(__dirname, './ressources/landscape-3779159_960_720.jpg'),
    path.resolve(__dirname, './ressources/gnu.txt'),
    new Payload({
        filePath: path.resolve(__dirname, './ressources/gnu.txt'),
        name: "gnu_renamed.txt" // Overide file name
    }),
    new Payload({   // Upload a buffer
        name: "test buffer with payload wrapper",
        buffer: Buffer.from("THIS IS A TEST BUFFER WRAPPED WITHIN wetransfert PAYLOAD")
    }),
    {
        name: "test buffer",
        buffer: Buffer.from("THIS IS A TEST BUFFER")
    },
    {
        name: "test stream from file",
        stream: fs.createReadStream(path.resolve(__dirname, './ressources/water-lily-3784022_960_720.jpg')),
        size: fs.statSync(path.resolve(__dirname, './ressources/water-lily-3784022_960_720.jpg')).size
    }
]

/////// DOWNLOAD SECTION ////////
// Download URI : ex: https://wetransfer.com/downloads/5ea8acc81f4da9f731da85c6cb162a1d20180404153650/9bf4079e384a573d2e12fb4a84e655d520180404153650/0b8279
const downloadURL = 'https://wetransfer.com/downloads/068f46823c14ad9c3b5ef39d0f01f90120210504211103/7924157e91f9eff675d18ac63fcc23b820210504211117/ecbda7'
// Your download folder, ex : /home/orgrimarr/wetransfer
const downloadFolder = path.resolve(__dirname, './tmp')

/////// UPLOAD SECTION /////////
// Sender email: ex mail@sender.com
const emailSender = 'mail@sender.com'
// Reveiver Mails, An array of all reveiver emails: ex: ['mail1@receiver.com', 'mail2@receiver.com']
const reveiverSender = ['mail1@receiver.com', 'mail2@receiver.com']
// An array of file you want to uconsolepload. Ex : ['/home/orgrimarr/wetransfer/file1', '/home/orgrimarr/wetransfer/file2']
const filesToUpload = testSamples //['/home/orgrimarr/wetransfer/file1', '/home/orgrimarr/wetransfer/file2']
// The body of the email
const body = 'Hi this is an upload from https://github.com/orgrimarr/node-wetransfert API'
// Language, used in the weetranfer download ux : ex: en, fr
const language = 'en'
// Time after which the quest will be canceled, if set to 0 the request will not be canceled. ex 0
const cancel = 0

const username = ""
const password = ""

/////// TEST SECTION //////////
const testDownload = function(fileIds = null){
    download(downloadURL, downloadFolder, fileIds)
        .onProgress(progress => {
            console.log('progress', progress)
        })
        .then((res) => {
            console.log(res) // success
        })
        .catch((err) => {
            console.error('error  ', err)
        })
}

const testDownloadPipe = async function(){
    const destName = `download_${Math.floor(Math.random() * 1000)}.zip`
    const downloadStream = await downloadPipe(downloadURL, null, (percent) => { 
        console.log('testDownloadPipe callback', percent) 
    })
    downloadStream.pipe(fs.createWriteStream(path.resolve(downloadFolder, destName)))
}

const testUpload = function(sender = emailSender, receiver = reveiverSender, toUpload = filesToUpload, content = body, lang = language){
    return new Promise((resolve, reject) => {
        const myUpload = upload(sender, receiver, toUpload, content, lang, username, password)
        
        myUpload.on('progress', (progress) => console.log('PROGRESS', progress))
        myUpload.on('error', (error) => {
            return reject(error)
        })
        myUpload.on('end', (end) => {
            return resolve(end)
        })
    
        if(cancel > 0){
            console.log("cance upload !")
            setTimeout(function(){
                myUpload.cancel()
            }, cancel)
        }
    })
}

const testUploadLink = function(){
    const myUpload = upload('', '', filesToUpload, body, language)
    .on('progress', (progress) => console.log('PROGRESS', progress))
    .on('end', (end) => console.log('END', end))
    .on('error', (error) => {
        if(error) console.error('ERROR', error.message)
        console.log("error", error)
    })

    if(cancel > 0){
        console.log("cance upload !")
        setTimeout(function(){
            myUpload.cancel()
        }, cancel)
    }
}



// Uncomment 

// testDownload()
// testDownloadPipe()
// testUploadLink()
// testUpload().then(console.log).catch(console.error)


// getInfo("https://wetransfer.com/downloads/0e6e055b442d5622f1ee18fbd5a085f620210901121828/74316c4e7a717f39399fc5b3ffb24bbb20210901121901/eb37d8")
// .then(response =>  {
//     console.log(JSON.stringify(response, null, 2))
// })
// .catch(console.error)


getInfo("https://wetransfer.com/downloads/0e6e055b442d5622f1ee18fbd5a085f620210901121828/74316c4e7a717f39399fc5b3ffb24bbb20210901121901/eb37d8")
.then(response =>  {
    var result = JSON.stringify(response, null, 2)
    console.log("downloadURI: ", response.downloadURI)
    console.log("recommended_filename: ", response.content.recommended_filename)
    downloadPipe(downloadURL, null, (percent) => { 
        console.log('DownloadPipe callback: ', percent) 
    }).then(downloadStream => {
        downloadStream.pipe(fs.createWriteStream(path.resolve(downloadFolder, response.content.recommended_filename)))
    }).catch(console.error)
})
.catch(console.error)  
