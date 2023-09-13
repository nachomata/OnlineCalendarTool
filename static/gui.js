function getEvents(formID) {
    const form = document.getElementsByClassName("mainForm")[formID]
    const url = form.querySelector(".url").value
    fetch(
        '/getEvents',
        {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({url: url})
        }
    ).then(response => response.json()).then(data => {
        let label = undefined
        let option = document.createElement("input")
        option.type = "checkbox"
        console.log(data.length)
        for (let i = 0; i<data.length; i++){
            label = document.createElement("label")
            option.value = data[i]
            label.appendChild(option.cloneNode())
            label.appendChild(document.createTextNode(data[i]))
            form.appendChild(label)
        }
    })
}


function generateLink(){
    const data = []
    const forms = document.getElementsByClassName("mainForm")
    console.log(forms)
    Array.from(forms).forEach(form => {
        const events = form.querySelectorAll('input[type="checkbox"]')
        let selectedEvents = []
        Array.from(events).forEach(event => {
            if (event.checked) {
                selectedEvents.push(event.value)
            }
        })
        data.push([form.querySelector(".url").value, selectedEvents])
    })


    console.log(data)
    const encodedText = utf8Base64UrlSafeEncode(JSON.stringify(data))
    document.getElementById("codeOutput").innerHTML = "<a target='_blank' href='c/"+encodedText+"'>"+encodedText+"</a>"
}

let numberOfForms = 0;
document.addEventListener("DOMContentLoaded", function() {
    addForm();
});



function addForm(){
    numberOfForms++
    const template = document.getElementById("templateForm")
    let newForm = template.content.cloneNode(true);
    const formDivs = document.getElementById("formsDiv")
    const tmpId = numberOfForms-1
    newForm.querySelector("button").onclick = function (){
        getEvents(tmpId)
    }
    formDivs.appendChild(newForm)
}

function removeForm(){
    if (numberOfForms>1){
        numberOfForms--
        const formDivs = document.getElementById("formsDiv")
        console.log(formDivs.lastChild)
        formDivs.removeChild(formDivs.lastChild)

    }

}

