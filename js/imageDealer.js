

function searchPhoto() {
    let value_input = $('#searchValue');
    let search_sentence = value_input.val();
    value_input.val('');
    console.log(search_sentence);

    //todo here: make the image search works

    let params ={
        q: search_sentence,
    };
    apigClient.searchGet(params, {}, {}).then((res)=>{
            console.log(res)
        }
    ).catch((e)=>{
        console.log('something goes wrong');
    })

}


// function addImage(blob, file_name) {
//     let file = new File([blob], file_name);
//     let fileName = file.name;
//     let foldKey = encodeURIComponent('images') + '/';
//
//     let audioKey = foldKey + fileName;
//     s3.upload({
//         Key: audioKey,
//         Body: file,
//         ACL: 'public-read'
//     }, function(err, data) {
//         if (err) {
//             return alert('There was an error uploading your photo');
//         }
//         else{
//             console.log('add')
//         }
//
//     });
// }


function upLoadPhoto(){

    let file = document.getElementById('inputFile').files[0];
    let file_name = file.name;
    let reader = new FileReader();

    let imgFile;

    reader.onload=function(e) {
        imgFile = e.target.result;
        $("#addPic").attr('src', imgFile);
        $("#addContain").removeClass('hide');
        document.getElementById('addName').innerText = "add file: " +file_name;
        // addImage(imgFile, file_name);

        // todo: make the upload image job works
        let params = {
            "Content-Type": 'application/json',
            "file_name": file_name,
        };
        let body = {
            imgFile
        };
        apigClient.uploadPut(params, body, {})
            .then(function(result){
                console.log('success')
            }).catch( function(result){
                console.log('failed')
        });
    };

    reader.readAsDataURL(file);
}