const urlRequest = 'http://127.0.0.1:5000/things';
const inputWithText = document.getElementById('writtenThing');
const tasksCounter = document.getElementById('countingText');


takeSavedThings()

inputWithText.addEventListener("keyup", function(event) {
    //fixme: use KeyboardEvent.code
    if (event.keyCode === 13) {
        event.preventDefault();
        const myText = getText()
        sendNewThingToDo(myText)
    }
});


    function takeSavedThings() {
        const savedThingsBackend = new XMLHttpRequest();
        savedThingsBackend.open('GET', urlRequest);
        savedThingsBackend.setRequestHeader('Content-Type', 'application/json');
        savedThingsBackend.send(JSON.stringify(savedThingsBackend))
        savedThingsBackend.onreadystatechange = () => takeSavedValues(savedThingsBackend)

    }

    function takeSavedValues(response) {
        if (response.readyState === 4) {
            const savedTasks = JSON.parse(response.response)
            const tasksAmount = savedTasks.length
            tasksCounter.innerHTML = `--------You have ${tasksAmount} saved tasks--------`
            for (const element of savedTasks) {
                const text = element.text
                const isDone = element.done
                const id = element.id
                addThing(text, isDone, id )
            }
        }
    }

    function sendRequest(method, request, thingId) {
        const httpRequest = new XMLHttpRequest();
        httpRequest.open(method, urlRequest + '/' + thingId.toString());
        console.log(urlRequest + '/' + thingId.toString())
        httpRequest.setRequestHeader('Content-Type', 'application/json')
        httpRequest.send(JSON.stringify(request));
    }

    function sendNewThingToDo(thingText) {
        const thingToDo = {
            text: thingText,
            done: false
        }
        console.log(thingToDo)
        const httpRequest = new XMLHttpRequest();
        httpRequest.open('POST', urlRequest);
        console.log(urlRequest)
        httpRequest.setRequestHeader('Content-Type', 'application/json');
        httpRequest.send(JSON.stringify(thingToDo));
        httpRequest.onreadystatechange = () => takeResponse(httpRequest);
        return httpRequest
    }

    function takeResponse(response) {
        if (response.readyState === 4) {
            const newThing = JSON.parse(response.response)
            console.log('newThing:', newThing)
            const text = newThing.text
            const isDone = newThing.done
            const id = newThing.id
            addThing(text, isDone, id)
        }
    }

    function addThing(thingText, isDone, thingId) {
        const text = createText(thingText);
        const checkButton = createCheckButton();
        const deleteButton = createDeleteButton();
        const newParagraph = createParagraph(text, checkButton, deleteButton, thingId);
        const divThingsToDo = document.getElementById('thingsToDo');
        divThingsToDo.appendChild(newParagraph)
        deleteButton.onclick = () => removeParagraph(newParagraph, isDone, thingId)
        checkButton.onclick = () => markTaskDone(text, checkButton, thingId)

    }


    function getText() {
        let writtenThing = document.getElementById('writtenThing');
        let writtenThingValue = writtenThing.value;
        writtenThing.value = '';
        return writtenThingValue;
    }


    function createText(writtenThing) {
        const spanWithText = document.createElement('span');
        spanWithText.innerText = writtenThing;
        return spanWithText;
    }

    function createCheckButton() {
        let checkButton = document.createElement('button');
        checkButton.setAttribute('class', 'checkButton');
        return checkButton;

    }

    function createDeleteButton() {
        let deleteButton = document.createElement('button');
        deleteButton.setAttribute('class', 'deleteButton');
        return deleteButton;

    }

    function createParagraph(thingText, checkButton, deleteButton, thingId) {
        let newParagraph = document.createElement('p');
        newParagraph.appendChild(deleteButton)
        newParagraph.appendChild(checkButton)
        newParagraph.appendChild(thingText)
        newParagraph.id = thingId;
        return newParagraph;

    }

    function removeParagraph(newParagraph, isDone, thingId) {
        newParagraph.remove()
        removeElementBackend(isDone, thingId)
    }

    function removeElementBackend(isDone, thingId) {
        const thingToRemove = {
            done: isDone,
            id: thingId
        }
        console.log('thing to remove', thingToRemove)
        sendRequest('DELETE', thingToRemove, thingId)
    }

    function markTaskDone(thingText, button, thingId) {
        if (button.classList.contains('marked')) {
            button.classList.remove('marked');
            thingText.classList.remove('strikethroughText')
            markTaskDoneBackend(thingText, false, thingId)
        } else {
            button.classList.add('marked');
            thingText.classList.add('strikethroughText')
            markTaskDoneBackend(thingText, true, thingId)
        }

    }

    function markTaskDoneBackend(thingText, isDone, thingId) {
        const taskDone = {
            text: thingText,
            done: isDone,
            id: thingId
        }
        console.log('task done', taskDone)
        sendRequest('POST',taskDone, thingId)
    }