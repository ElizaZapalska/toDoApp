const urlRequest = 'http://127.0.0.1:5000/things';
const inputWithText = document.getElementById('writtenThing');
const tasksCounter = document.getElementById('countingText');
let base, dragging, draggedOver;


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
            console.log('savedTasks', savedTasks)
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
            done: 0
        }
        console.log('thing to do', thingToDo)
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
        const newParagraph = createParagraph(text, checkButton, deleteButton, thingId, isDone);
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
        spanWithText.setAttribute('class', 'thingText')
        spanWithText.innerText = writtenThing;
        return spanWithText;
    }

    function createCheckButton() {
        let checkButton = document.createElement('img');
        checkButton.setAttribute('class', 'buttons');
        checkButton.setAttribute('class', 'checkButton');
        return checkButton;

    }

    function createDeleteButton() {
        let deleteButton = document.createElement('img');
        deleteButton.setAttribute('class', 'buttons');
        deleteButton.setAttribute('class', 'deleteButton');
        return deleteButton;

    }

    function createParagraph(thingText, checkButton, deleteButton, thingId, isDone) {
        let newParagraph = document.createElement('p');

        if (isDone === 0) {
            checkButton.classList.remove('marked');
            thingText.classList.remove('strikethroughText')
        } else {
            checkButton.classList.add('marked');
            thingText.classList.add('strikethroughText')
        }

        newParagraph.appendChild(checkButton)
        newParagraph.appendChild(thingText)
        newParagraph.appendChild(deleteButton)
        newParagraph.id = thingId;

        newParagraph.draggable = true;
        newParagraph.addEventListener('dragstart', handleDragStart);
        newParagraph.addEventListener('dragover', handleDragOver);
        newParagraph.addEventListener('drop', handleDrop)

        return newParagraph;

    }

    function handleDragStart(event) {
        const id = this.id;
        event.dataTransfer.setData('target-id', id);
        event.dataTransfer.setData('start-y', event.y);
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDrop(event) {
        event.preventDefault();
        const dropElement = this;
        const dragTargetId = event.dataTransfer.getData('target-id');
        const dragElement = document.getElementById(dragTargetId);

        if (event.y - event.dataTransfer.getData('start-y') < 0) {
            dropElement.before(dragElement);
        } else {
            dropElement.after(dragElement);
        }
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
            markTaskDoneBackend(thingText, 0, thingId)
        } else {
            button.classList.add('marked');
            thingText.classList.add('strikethroughText')
            markTaskDoneBackend(thingText, 1, thingId)
        }

    }

    function markTaskDoneBackend(thingText, isDone, thingId) {
        const taskDone = {
            text: thingText.innerText,
            done: isDone,
            id: thingId
        }
        console.log('task done', taskDone)
        sendRequest('POST',taskDone, thingId)
    }