function getExpireCookie(){
    let cookie = document.cookie
    let cookieEntries = cookie.split(";")
    for(let i of cookieEntries){
        if(i.split("=")[0].trim() == "expire"){
            return parseInt(i.split("=")[1])
        }
    }
}

function convertMsToTime(ms){
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
   
    return (
        seconds == 60 ?
        (minutes+1) + ":00" :
        minutes + ":" + (seconds < 10 ? "0" : "") + seconds
      );
}


if(document.getElementById("logoutTimer") != undefined){
    var logoutTimer = setInterval(()=>{
        if(getExpireCookie()-Date.now()<0){
            window.location = "/login"
        }

        let timerElement = document.getElementById("logoutTimer")
        timerElement.innerText = convertMsToTime(getExpireCookie()-Date.now())
    }, 1000)
}

function openDialog(id){
    document.getElementById(id).showModal()
}

function closeDialog(id){
    document.getElementById(id).close()
}

function submitForm(url,form){
    let formData = new FormData(form)
    let jsonPayload = {}

    formData.forEach((v,k)=>{
        jsonPayload[k] = v;
    })

    fetch(url, {method: "post", redirect:"manual", headers: {"Content-Type": "application/json"}, body: JSON.stringify(jsonPayload)})
    .then((res)=>{
        console.log("fetch", res.headers.get("Location"))
        const redirectUrl = res.headers.get('Location');
        if (redirectUrl) {
        window.location.href = redirectUrl;
    }
    })
}

function validateUploadForm(form){
    let name = document.getElementById("name") 
    amount.disabled = false;
    balanceHUF.disabled = false;
    submitUpload.disabled = true;
    
    if(String(amount.value).length>0){
        balanceHUF.disabled = true
        balanceHUF.value = ""
    } else if(String(balanceHUF.value).length>0){
        amount.disabled = true
        amount.value = ""
    } else{
        amount.disabled = false
        balanceHUF.disabled = false
    }
    name.value = name.value.toUpperCase()
    if(name.value.toUpperCase()=="UTALÁS"){
        amount.value = ""
        amount.disabled = true
        priceUSD.value = ""
        priceUSD.disabled = true
        USDHUF.value = ""
        USDHUF.disabled = true
    } else{
        priceUSD.disabled = false
        USDHUF.disabled = false
    }
    if(
        (amount.value !="" || balanceHUF.value!="") && user.value !="" && date.value !="" && priceUSD.value !="" && USDHUF.value!=""
    ){
        submitUpload.disabled = false
    } else if(
        (balanceHUF.value!="") && user.value !="" && date.value !="" && name.value.toUpperCase() == "UTALÁS"
    ) {
        submitUpload.disabled = false
    } else{
        submitUpload.disabled = true
    }
    
}
validateUploadForm(document.getElementById("uploadForm"))

var selectedRow = undefined;
function selectTableRow(row){
    if(selectedRow!=undefined){
        selectedRow.classList.remove("selected")
    }
    selectedRow = row
    selectedRow.classList.add("selected")
}

document.body.onclick = (e)=>{
    if(selectedRow!=undefined&&e.target.nodeName != "TD"){
        selectedRow.classList.remove("selected")
    }
}

function deleteSelectedRow(){
    if(selectedRow == undefined){
        alert("Nincs kijelölve sor")
        return
    }
    fetch("/stock", {method: "delete", redirect: "manual", headers:{"Content-Type": "application/json"}, body: JSON.stringify({id: parseInt(selectedRow.dataset.id)})}).then((res)=>{
        console.log("fetch", res.headers.get("Location"), selectedRow.dataset.id)
        const redirectUrl = res.headers.get('Location');
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    })
}