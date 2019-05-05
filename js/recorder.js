rec=Recorder(); // use the default format, mp3
date = new Date();

albumBucketName = 'cc-b2';
bucketRegion = 'us-east-1';
IdentityPoolId ="us-east-1:78533925-8564-496a-b0c2-e3449bd1a6f5"; // good for unauthorized people

AWS.config.update({
    region: bucketRegion,
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId
    })
});

s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {Bucket: 'cc-b2'}
});


function addAudio(blob) {
    let file = new File([blob], "input_audio.mp3");
    let fileName = file.name;
    let foldKey = encodeURIComponent('tmp_audio') + '/';

    let audioKey = foldKey + fileName;
    s3.upload({
        Key: audioKey,
        Body: file,

        ACL: 'public-read'
    }, function(err, data) {
        if (err) {
            return alert('There was an error uploading your audio');
        }
        alert('Successfully uploaded audio.');
    });
}


function start_record(duration) {
    rec.open(function(){ // open the recorder source
        rec.start();// begin to record
        setTimeout(function(){
            rec.stop(function(blob,duration){//到达指定条件停止录音
                console.log(URL.createObjectURL(blob),"时长:"+duration+"ms");
                rec.close();
                let audio=document.createElement("audio");
                let download =document.createElement("a");
                audio.controls=true;
                document.body.appendChild(audio);
                document.body.appendChild(download);
                download.href = URL.createObjectURL(blob);
                audio.src=URL.createObjectURL(blob);
                audio.play();
            },function(msg){
                console.log("Recording Failed:"+msg);
            });
        }, duration * 30000);

    },function(msg,isUserNotAllow){ // failure case
        alert((isUserNotAllow?"UserNotAllow，":"")+"cannot record:"+msg);
    });
}

function stop_record() {
    rec.stop(function(blob,duration){//到达指定条件停止录音
        console.log(URL.createObjectURL(blob),"时长:"+duration+"ms");
        rec.close();
        let audio=document.createElement("audio");
        audio.controls=true;
        document.body.appendChild(audio);
        audio.src=URL.createObjectURL(blob);
        audio.play();
        addAudio(blob);
    },function(msg){
        console.log("Recording Failed:"+msg);
    });

}

function dealRecorder(duration) {
    let record = $('#record');
    if (record.hasClass('recording')){
        stop_record();
        record.removeClass('recording');
    }
    else{
        record.addClass('recording');
        start_record(duration);
    }
}

