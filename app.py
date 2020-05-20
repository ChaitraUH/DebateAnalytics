import json

import pandas as pd
from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
import dns

app = Flask(__name__)

candidate_list = ""
links = []


@app.route('/', methods=['POST', 'GET'])
def index_page():
    return render_template("index.html")


@app.route('/load-next', methods=['POST'])
def load_next():
    global candidate_list
    global links
    links = []
    vid = request.form.get("inp")
    candidate_list = request.form.get("text-area")
    vid = vid.replace("watch?v=", "embed/")
    vid = vid + "?enablejsapi=1"
    return render_template("next.html", vid=vid)


@app.route('/load-candidates', methods=['GET'])
def load_candidates():
    candidates = json.loads(candidate_list)
    result_frame = pd.DataFrame()
    result_frame['name'] = candidates.keys()
    result_frame['img'] = candidates.values()
    resp_data = result_frame.to_dict(orient='records')
    values = json.dumps(resp_data, indent=2)
    return_data = {'return_data': values}
    return jsonify(return_data)


@app.route('/post-attack', methods=['POST'])
def attack_data_response():
    if request.method == 'POST':
        data = request.json
        mongo_insert(data)
    return "submitted data\n"

@app.route('/post-topic-change', methods=['POST'])
def topic_change_response():
    print("topic_change_response")
    if request.method == 'POST':
        data = request.json
        mongo_insert_topic(data)
        return_data = update_topic_links(data)
        print("return_data", return_data)
    return jsonify(return_data)

def update_topic_links(data):
    global links
    nodes = ["None", "Foreign Policy", "Gun Control", "Taxes", "Healthcare", "Economic Inequality", "Education"]
    src = nodes.index(data["from"])
    trgt = nodes.index(data["to"])
    for i,l in enumerate(links):
        if l["source"] == src and l["target"] == trgt:
            links[i]["value"] = links[i]["value"] + 2
            return links
    links.append({"source":src,"target":trgt,"value":2})
    return links

def mongo_insert(data):
    # client = MongoClient('mongodb://localhost:27017')
    client = MongoClient('mongodb+srv://chegde:LS1setup!@cluster0-ef4b7.azure.mongodb.net/test?retryWrites=true&w=majority')
    db = client["debatedata"]
    collection = db["attack"]
    print(data)
    insertion = collection.insert_one(data)
    print(insertion)

def mongo_insert_topic(data):
    client = MongoClient('mongodb+srv://chegde:LS1setup!@cluster0-ef4b7.azure.mongodb.net/test?retryWrites=true&w=majority')
    db = client["debatedata"]
    collection = db["topic"]
    insertion = collection.insert_one(data)

if __name__ == '__main__':
    app.run(debug=True)