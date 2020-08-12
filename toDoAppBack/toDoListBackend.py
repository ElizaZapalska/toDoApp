from flask import Flask, request, abort, jsonify
from flask_cors import CORS
import mysql.connector
import datetime

app = Flask(__name__)
CORS(app)

toDoThings = {}
thingsToSend = []
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
    cursor.execute(sql, thingSavedInDatabase)
    database.commit()


def pickUpThingsFromDatabase():
    cursor = database.cursor()
    cursor.execute("SELECT * FROM things")
    databaseThings = cursor.fetchall()
    print("databaseThings:", databaseThings)
    return databaseThings


def removeFromDatabase(id):
    cursor = database.cursor()
    print('dupa')
    sql = "DELETE FROM things WHERE id = %s" % str(id)
    cursor.execute(sql)
    database.commit()


def updateDatabase(done, id):
    cursor = database.cursor()
    print('elooooo')
    print('done', done)
    print(type(done), "type of doneee")

    sql = "UPDATE things SET is_done = %s WHERE id = %s" % (str(done), str(id))
    cursor.execute(sql)
    database.commit()


@app.route('/things', methods=['GET'])
def appendThingsToSend():
    print('hejkaaaaa')
    thingsToSend = pickUpThingsFromDatabase()
    thingsToJS = []
    for thing in thingsToSend:
        thingToSend = {
            'id': thing[0],
            'text': thing[1],
            'done': thing[2],
        }
        thingsToJS.append(thingToSend)
    return jsonify(thingsToSend)


@app.route('/things', methods=['POST'])
def pickUpNewThingToDo():
    newThingToDo = request.json
    createdThing = {'text': newThingToDo['text'],
                    'done': newThingToDo['done']
                    }
    saveToDatabase(createdThing)
    thingsToSend = pickUpThingsFromDatabase()
    for thing in thingsToSend:
        thingToSend = {
            'id': thing[0],
            'text': thing[1],
            'done': thing[2],
            'created': thing[3]
        }

    print("things to send", thingToSend)

    return jsonify(thingToSend)


@app.route('/things/<id>', methods=['DELETE'])
def removeElement(id):
    thingToRemove = request.json
    deletedThingId = int(id)
    try:
        removeFromDatabase(deletedThingId)
    except KeyError:
        abort(404)

    return thingToRemove


@app.route('/things/<id>', methods=['POST'])
def markTaskDone(id):
    checkedThing = request.json
    try:
        updateDatabase(checkedThing['done'], id)
    except KeyError:
        abort(404)

    print('toDoThings', toDoThings)
    return checkedThing



