from flask import Flask, request, abort, jsonify
from flask_cors import CORS
import mysql.connector
import datetime

app = Flask(__name__)
CORS(app)

toDoThings = {}
thingsToSend = []
database = None


def initDatabase():
    global database
    database = mysql.connector.connect(
        host='localhost',
        user='root',
        password='Weronka97',
        database='todoappdatabase'
    )


def saveToDatabase(thing):
    cursor = database.cursor()
    sql = "INSERT INTO things (text, is_done, created) VALUES (%s, %s, %s)"
    print('thing', thing)
    if thing['done']:
        thing['done'] = 1
    else:
        thing['done'] = 0
    createdDay = str(datetime.date.today())
    thingSavedInDatabase = (thing['text'], thing['done'], createdDay)
    print('thingSavedInDatabase', thingSavedInDatabase)
    cursor.execute(sql, thingSavedInDatabase)
    database.commit()


# use i it to iterate and create id
i = 0


def getId():
    global i
    i += 1
    return i


@app.route('/things', methods=['GET'])
def appendThingsToSend():
    for thing in toDoThings:
        if toDoThings[thing] in thingsToSend:
            break
        else:
            saveToDatabase(toDoThings[thing])
            thingsToSend.append(toDoThings[thing])

    print('sendToJs', thingsToSend)
    for thing in thingsToSend:
        print('test', thing)
    return jsonify(thingsToSend)


@app.route('/things', methods=['POST'])
def pickUpNewThingToDo():
    newThingToDo = request.json
    newThingToDo['id'] = getId()
    id = newThingToDo['id']
    toDoThings[id] = newThingToDo
    createdThing = {'text': newThingToDo['text'],
                    'done': newThingToDo['done'],
                    'id': newThingToDo['id']
                    }

    saveToDatabase(createdThing)
    if createdThing not in thingsToSend:
        thingsToSend.append(createdThing)
    return jsonify(createdThing)


@app.route('/things/<id>', methods=['DELETE'])
def removeElement(id):
    thingToRemove = request.json
    deletedThingId = int(id)
    try:
        thingsToSend.remove(toDoThings[deletedThingId])
        toDoThings.pop(deletedThingId)
    except KeyError:
        abort(404)

    return thingToRemove


@app.route('/things/<id>', methods=['POST'])
def markTaskDone(id):
    checkedThing = request.json
    try:
        checkedTaskId = int(id)
        value = toDoThings[checkedTaskId]
        value['done'] = checkedThing['done']
    except KeyError:
        abort(404)

    print('toDoThings', toDoThings)
    return checkedThing


if __name__ == "__main__":
    initDatabase()
    app.run(debug=True)
