var previous_selection = "None";
var candidates_map = new Array();
var candidates = new Array();
var candidate_positions = new Object();
var color_map = {
        'Amy Klobuchar':'purple',
        'Andrew Yang': 'red',
        'Bernie Sanders':'aqua',
        'Beto Orourke':'brown',
                 'Bill Weld': 'green',
                 'Bill DeBlasio': 'yellow',
                 'Cory Booker': 'blue',
                 'Deval Patrick':'deeppink',
                 'Donald Trump':'indigo',
                 'Elizabeth Warren':'lightgreen',
                 'Eric Swalwell':'maroon',
                 'Jay Inslee':'orange',
                 'Joe Biden':'orchid',
                 'Joe Sestak':'seagreen',
                 'Joe Walsh':'teal',
                 'John Delaney':'slategray',
                 'John Hickenlooper':'silver',
                 'Julian Castro':'pink',
                 'Kamala Harris':'magenta',
                 'Kristen Gillibrand':'crimson',
                 'Mark Sanford':'chocolate',
                 'Merianne Williomson':'cyan',
                 'Mike Bloomberg':'darkgray',
                 'Pete Buttigieg':'MediumTurquoise',
                 'Rechard Ojeda':'Navy',
                 'Seth Moulton':'Olive',
                 'Steve Bullock':'PaleVioletRed',
                 'Tim Ryan':'RoyalBlue',
                 'Tom Steyer':'Salmon',
                 'Tulsi Gabbard':'Tomato',
                 'Wayne Messam':'YellowGreen'};


function plotAttacks(){
    //context.clearRect(0, 0, 800, 800);
    var canvas = document.getElementById("canvas");
const rc = rough.canvas(canvas);
             

    var arr_pos = 100;
    for(let item of candidates_map){
        var attacker = item[0];
        var defender = item[1];
    
        var color = color_map[attacker];
    arr_pos += 20;
    rc.line(arr_pos, candidate_positions[attacker], arr_pos, candidate_positions[defender], {stroke:color});
    if(candidate_positions[attacker] < candidate_positions[defender]){
        //down arrow
        rc.line(arr_pos - 8, candidate_positions[defender] - 10, arr_pos, candidate_positions[defender], {stroke:color});
        rc.line(arr_pos + 8, candidate_positions[defender] - 10, arr_pos, candidate_positions[defender], {stroke:color});
    }
    else{
        //up arrow
        rc.line(arr_pos, candidate_positions[defender], arr_pos - 8, candidate_positions[defender] + 10, {stroke:color});
        rc.line(arr_pos, candidate_positions[defender], arr_pos + 8, candidate_positions[defender] + 10, {stroke:color});
    }

    }
    //line and rectangle
    
}

window.onload = function() {
   $.get("/load-candidates", {'data': 'received'}, function(load_candidates) {
       data = JSON.parse(load_candidates.return_data)
       createlist(data);
       candidates = data;

       var canvas = document.getElementById("canvas");
const rc = rough.canvas(canvas);
var context = canvas.getContext("2d");
             

       var itr = 0;
    for(let candidate of candidates){
        rc.line(50, 35 + itr, 700, 35 + itr);
        var candidate_img = new Image();
        candidate_img.src = candidate['img'];
        context.drawImage(candidate_img, 10, itr + 10, 40, 40);
        candidate_positions[candidate['name']] = 35 + itr;
        itr += 50;
    }


   });
};


function createlist(data){
    var ul = document.getElementById("can-list");
    for(i=0; i<data.length; i++){
        var li = document.createElement('li');
        var img = document.createElement("img");
        img.src = data[i]['img'];
        console.log(data[i]['img'])
        console.log(data[i]['name'])
        img.draggable = false;
        var p = document.createElement('p')
        p.innerHTML = " "+data[i]['name'];
        p.draggable = true;
        p.id = i;
        p.setAttribute("ondragstart", "dragStart(event)")
        li.appendChild(img);
        li.appendChild(p);
        ul.appendChild(li)
    }
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("Text");
    event.target.value = document.getElementById(data).innerHTML;
    videoPause()
}

function dragStart(event) {
    event.dataTransfer.setData("Text", event.target.id);
}

function allowDrop(event) {
  event.preventDefault();
}

function tagging() {
    var attacker_input = document.getElementById("attacker");
    var defender_input = document.getElementById("attackee");
    attacker_name = (attacker_input.value).trim();
    defender_name = (defender_input.value).trim();
    candidates_map.push([attacker_name, defender_name]);
    plotAttacks();
    var datadict = {
        'attacker': attacker_name,
        'defender': defender_name
    };
    datastring = JSON.stringify(datadict);
    const url='http://127.0.0.1:5000/post-attack';

    $.ajax({
      type: "POST",
      contentType: "application/json; charset=utf-8",
      url: url,
      data: datastring,
      success: function (data) {
        console.log(data.title);
        console.log(data.article);
      },
      dataType: "json"
    });
    attacker_input.value = "";
    defender_input.value = "";
    videoPlay()

}

function select_topic() {
    var topic_dropdown = document.getElementById("topic_select");
    var current_selection = topic_dropdown.options[topic_dropdown.selectedIndex].text;
    var datadict = {
        'from': previous_selection,
        'to': current_selection
    };
    previous_selection = current_selection;
    console.log("TOPICS", datadict);
    var datastring = JSON.stringify(datadict);
    const url='http://127.0.0.1:5000/post-topic-change';
    var links = []; 
    $.ajax({
      type: "POST",
      async:false,
      contentType: "application/json; charset=utf-8",
      url: url,
      data: datastring,
      success: function (data) {
        console.log(data);
        links = data;//$.parseJSON(data);
      },
      dataType: "json"
    });
    console.log("100 links", links)
    load_topic_vis(links);
}

function videoPause(){
    $('.video').each(function(){
        this.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
    });
}

function videoPlay(){
    $('.video').each(function(){
        this.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*')
    });
}