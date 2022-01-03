function checksss(){
    if(document.getElementById("menu-bar").checked == false){
        document.getElementById("DivLogin2").style.display="flex";
    }else{
        document.getElementById("DivLogin2").style.display="none";
    }
}
function click() {
    document.getElementById("IconoMenu").addEventListener("click",check())
}

