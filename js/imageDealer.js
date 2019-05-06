
function addImage(blob, file_name) {
    // This function use s3 sdk, as a backup method;
    let file = new File([blob], file_name);
    let fileName = file.name;
    let foldKey = encodeURIComponent('images') + '/';

    let audioKey = foldKey + fileName;
    s3.upload({
        Key: audioKey,
        Body: file,
        ACL: 'public-read'
    }, function(err, data) {
        if (err) {
            return alert('There was an error uploading your photo');
        }
        else{
            console.log('add')
        }

    });
}

function upLoadPhoto(){

    let file = document.getElementById('inputFile').files[0];
    let file_name = file.name;
    let file_type = file.type;
    let reader = new FileReader();

    reader.onload = function() {
        let arrayBuffer = this.result;
        let blob = new Blob([new Int8Array(arrayBuffer)], {
            type: file_type
        });
        let blobUrl = URL.createObjectURL(blob);

        $("#addPic").attr('src', blobUrl);
        $("#addContain").removeClass('hide');
        document.getElementById('addName').innerText = "Add File: " +file_name;
        console.log(blob);
        addImage(blob, file_name);

        // todo: make the upload image job works
    //     let params = {
    //         "Content-Type": 'application/json',
    //         "file_name": file_name,
    //     };
    //     let body = {
    //         blob
    //     };
    //     apigClient.uploadPut(params, body, {})
    //         .then(function(result){
    //             console.log('success')
    //         }).catch( function(result){
    //             console.log('failed')
    //     });
    };

    reader.readAsArrayBuffer(file);
}

function diaplayItem(src, file_name) {
    let $template = $(
       ` <div class="card">
            <img class="card-img-top" src=${src}>
            <p class="card-text">${file_name}</p>
        </div>
        <br>`
    );
    $('#picContain').append($template);
    if ($('#albumContain').hasClass('hide')) {
        $('#albumContain').removeClass('hide');
    }
}

function searchPhoto() {
    $('#albumContain').addClass('hide');
    $('#picContain').empty();

    let value_input = $('#searchValue');
    let search_sentence = value_input.val();
    if(search_sentence.search("show me") === -1){
        search_sentence = "show me " + search_sentence;
    }
    value_input.val('');
    console.log(search_sentence);

    let params ={
        q: search_sentence,
    };
    apigClient.searchGet(params, {}, {}).then((res)=>{
            console.log(res);
    // todo use display item function here to create new pictures
    let body = res['data']['body'];
    for(let key in body) {
      let test_src = body[key];
      let test_name = key;
      console.log(key);
      diaplayItem(test_src, test_name);
    }

  }
    ).catch((e)=>{
        console.log('something goes wrong');
    })

}
