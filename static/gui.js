function getEvents(button) {
    button.disabled = true
    //Comprobar que hay url
    const input = button.previousElementSibling.querySelector(".url")
    if(!input.reportValidity()){
        button.disabled = false
        return
    }

    // Eliminar el form anterior
    const form = button.parentElement.parentElement;
    const toDelete = form.querySelector(".optionsDiv")
    if (toDelete != null) form.removeChild(toDelete)

    // Crear el cargando...
    form.appendChild(document.createTextNode("Obteniendo eventos desde URL..."))

    // hacer el fetch
    const url = input.value
    fetch(
        '/getEvents',
        {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({url: url})
        }
    ).then(response => response.json()).then(data => {
        // eliminar el cargando...
        form.removeChild(form.lastChild)

        // crear options
        let optionsDiv = document.createElement("div")
        optionsDiv.classList.add("optionsDiv")
        let selectAllCheckbox = document.createElement("input");
        selectAllCheckbox.type = "checkbox";
        selectAllCheckbox.classList.add("selectAll");
        let selectAllLabel = document.createElement("label");
        selectAllLabel.appendChild(selectAllCheckbox);
        selectAllLabel.appendChild(document.createTextNode("Seleccionar todos"));

        optionsDiv.appendChild(selectAllLabel);


        let eventsDiv = document.createElement("div")
        eventsDiv.classList.add("eventsDiv")
        let label = undefined
        let option = document.createElement("input")
        option.type = "checkbox"
        for (let i = 0; i<data.length; i++){
            label = document.createElement("label")
            option.value = data[i]
            label.appendChild(option.cloneNode())
            label.appendChild(document.createTextNode(data[i]))
            eventsDiv.appendChild(label)
        }
        optionsDiv.appendChild(eventsDiv)
        selectAllCheckbox.addEventListener("change", function() {
            let checkboxes = eventsDiv.querySelectorAll('input[type="checkbox"]');
            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].checked = selectAllCheckbox.checked;
            }
        });
        form.appendChild(optionsDiv)

        button.disabled = false
    })
}


function generateLink(){
    // check if data is correct
    const forms = document.getElementsByClassName("mainForm")

    for (let i = 0; i < forms.length; i++){
        const input = forms[i].querySelector(".url")
        if(!input.reportValidity()) return
    }

    const data = []
    const calendarName = document.getElementById("calendarName").value
    if (calendarName !== '') data.push([calendarName])

    Array.from(forms).forEach(form => {
        const events = form.querySelectorAll('input[type="checkbox"]')
        let selectedEvents = []
        Array.from(events).forEach(event => {
            if (event.checked && !event.classList.contains("selectAll")) {
                selectedEvents.push(event.value)
            }
        })
        data.push([form.querySelector(".url").value, selectedEvents])
    })


    const encodedText = utf8Base64UrlSafeEncode(JSON.stringify(data))
    let url = "https://calendar.nachomata.es/c/"+encodedText

    // mostrar enlace
    const linkInput = document.getElementById("linkInput");
    linkInput.value = url;

    // Agrega un evento click al botón para copiar el enlace al portapapeles
    const copyButton = document.getElementById("copyButton");
    copyButton.addEventListener("click", async () => {
        const linkDiv = document.getElementById("linkDiv")
        let result
        let buttonDisplay
        try {
            await navigator.clipboard.writeText(url);
            result = '¡Link copiado al portapapeles!'
            buttonDisplay = 'inline-block'
        } catch (err) {
            result = '¡Link generado correctamente!'
            buttonDisplay = 'none'
        }
        linkDiv.querySelector("span").innerText = result
        linkDiv.querySelector("button").style.display = buttonDisplay
        linkDiv.style.display = 'flex'
    });
    copyButton.click()

}

let numberOfForms = 0;



function addForm(){
    numberOfForms++
    const template = document.getElementById("templateForm")
    let newForm = template.content.cloneNode(true);
    const formDivs = document.getElementById("formsDiv")
    let buttons = newForm.querySelectorAll("button")
    buttons[0].onclick = function (){
        getEvents(this)
    }
    buttons[1].onclick = function (){
        removeForm(this)
    }

    newForm.querySelector(".url").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            this.parentElement.nextElementSibling.click()
        }
    });
    formDivs.appendChild(newForm)
}

function removeForm(button){
    numberOfForms--
    const formDivs = document.getElementById("formsDiv")
    formDivs.removeChild(button.parentElement.parentElement)
    if (numberOfForms===0) addForm()

}

document.addEventListener("DOMContentLoaded", function() {
    addForm();
    document.getElementById("calendarName").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            document.querySelector("#main > button.button.blueButton").click()
        }
    })
});
