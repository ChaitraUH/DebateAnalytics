var candidates = new Object()
function setvalue(event){
    //console.log(event.value);
    if(event.id in candidates){
        delete candidates[event.id]
        event.style.backgroundColor = "#f8f8ff";
    }
    else {
        candidates[event.id] = event.value;
        event.style.backgroundColor = "#b0e0e6";
    }
    document.getElementById("text-area").innerHTML = JSON.stringify(candidates);
}

