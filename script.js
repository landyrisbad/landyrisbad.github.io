const imageWidth = 2228;
const imageHeight = 2016;
var image = document.getElementById("set");
var holdData = document.getElementById("hold-data").innerText;
holdData = holdData.split("\n").slice(1);
var actualHolds = holdData.slice(2);
var board = document.getElementById("board");

function comparison (a,b) {
    var point1 = a.split(",")
    var point2 = a.split(",")

    if (Number(point1[0]) + Number(point1[1]) > Number(point2[0]) + Number(point2[1])) {
        return -1;
    }
    if (Number(point1[0]) + Number(point1[1]) < Number(point2[0]) + Number(point2[1])) {
        return 1;
    }
    return 0;
}

function setHoldButtons () {
    var xScale = image.clientWidth / imageWidth;
    var yScale = image.clientHeight / imageHeight;

    var pointStandard = actualHolds[0].split(",");
    var pointx = Number(pointStandard[0]);
    var pointy = Number(pointStandard[1]);
    var imgx = image.getBoundingClientRect().left - board.getBoundingClientRect().left;
    var imgy = image.getBoundingClientRect().top - board.getBoundingClientRect().top;

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute("height", `${imageHeight * yScale}`);
    svg.setAttribute("width", `${imageWidth * xScale}`);
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.style = `position:absolute;top:${imgy};left:${imgx};`;

    var polygonCorners = [];
    var totx = 0;
    var toty = 0;
    var index = 0;
    actualHolds.forEach(function (element, i) {
        if (element == "") {
            var poly = document.createElementNS('http://www.w3.org/2000/svg', "polygon");
            poly.setAttribute("points", polygonCorners.join(" "));
            poly.setAttribute("class", "hand-hold");
            poly.setAttribute("id",index);
            svg.appendChild(poly);
            poly.addEventListener("click", setHold);
            poly.addEventListener("click", () => {
                console.log(i+446);
            });
            var circle = document.createElementNS('http://www.w3.org/2000/svg', "circle");
            circle.setAttribute("class", "hand-hold-circle");
            circle.setAttribute("id", `${index}-circle`);
            circle.setAttribute("r", "2");
            circle.setAttribute("cx", `${totx / polygonCorners.length}`);
            circle.setAttribute("cy", `${toty / polygonCorners.length}`);
            circle.setAttribute("r", "4");
            circle.addEventListener("click", () => {
                document.getElementById(`${event.target.id.split("-")[0]}`).dispatchEvent("click");
            });
            toty = 0;
            totx = 0;
            svg.appendChild(circle);
            polygonCorners = [];
            index += 1;
        } 
        else {
            coords = element.split(",");
            var x = Math.floor((Number(coords[1]) * xScale));
            var y = Math.floor((Number(coords[0]) * yScale));
            polygonCorners.push(`${x},${y}`);
            totx += x;
            toty += y;
        }
    });
    board.appendChild(svg);
}
setHoldButtons();

function removeHoldButtons () {
    while (board.firstChild) {
        if (board.children.length == 1) {
            return;
        }
        board.removeChild(board.lastChild);
    }
}

var currentSet = "";
var buttons = []
const setButton = class {
    constructor(id, color) {
        this.element = document.getElementById(id);
        this.element.addEventListener("click", () => {
            this.selectMe(true);
        })
        this.name = id
        this.color = color;
        this.isSelected = false;
        buttons.push(this);
    }

    selectMe (value) {
        if (value == false) {
            this.isSelected = false;
            this.element.style.backgroundColor = "rgba(0,0,0,0)";
            return;
        }
        buttons.forEach((element, i) => {
            element.selectMe(false);
        });
        currentSet = this.name;
        this.isSelected = true;
        this.element.style.backgroundColor = this.color;
    }
}

var setting = false;
var startSetting = document.getElementById("set-title");
startSetting.addEventListener("click", () => {
    removeHoldButtons();
    if (setting) {
        document.getElementById("setting").style.display = "none";
        document.getElementById("error").style.display = "none";
        setting = false;
        document.getElementById("set").classList.remove("current");
        startSetting.style.color = "black";
        window.location.href = "";

    }
    else {
        setting = true;
        document.getElementById("set").classList.add("current");
        document.getElementById("setting").style.display = "flex";
        document.getElementById("error").style.display = "block";
        window.location.href = "#set"
        startSetting.style.color = "red";
    }
    setHoldButtons();
});

var types = {
    start: new setButton("start", "lightgreen"),
    finish: new setButton("finish", "palevioletred"),
    hands: new setButton("hands", "lightblue"),
}

var set = {
    start: [],
    finish: [],
    hands: [],
    feet: []
}

function setHold(event) {
    if (document.getElementById(`${event.target.id}`).style.fill == types[currentSet].color) {
        removeHold(event.target);   
    }
    else if (document.getElementById(`${event.target.id}`).style.fill != "") {
    }
    else { 
        if (currentSet == "start" & set[currentSet].length >= 2) {
            displayError("Can't have more than 2 start holds");
            return;
        }
        if (currentSet == "finish" & set[currentSet].length >= 2) {
            displayError("Can't have more than 2 finishing holds");
            return;
        }
        if (currentSet == "feet" & event.target.className == "hand-hold") {
            displayError("Can't put feet on the wooden holds");
            return;
        }
        addHold(event.target);
    }
}

var estatus = document.getElementById("error");
function displayError (message) {
    estatus.style.transition = "0.2s";
    estatus.style.backgroundColor = "red";
    document.getElementById("status").innerText = message;
    setTimeout(() => {
        estatus.style.transition = "1s";
        estatus.style.backgroundColor = "white";
    }, 100);
    setTimeout(() => {
        document.getElementById("status").innerText = "Currently Setting";
    }, 1500);
}

function addHold (element) {
    set[currentSet].push(element.id);
    document.getElementById(`${element.id}`).style.stroke = types[currentSet].color;
}

function removeHold (element) {
    document.getElementById(`${element.id}`).style.fill = "";
    set[currentSet].splice(set[currentSet].indexOf(element.id)-1, 1);
}

function getSetcode () {
    if (set["start"].length < 1) {
        return "error.no start hold";
    }
    if (set["finish"].length < 1) {
        return "error.no finish hold";
    }
    return `${set["start"].toString()}.${set["finish"].toString()}.${set["hands"].toString()}.${set["feet"].toString()}`
}

loadSet("");

function loadSet (setcode) {
    if (setcode == "") {
        var getValues = new URLSearchParams(location.search);
        if (getValues.has("setData")) {
            setcode = atob(getValues.get("setData"));
        }
        else {
            return;
        }
    }

    removeHoldButtons();
    setHoldButtons();
    setcode = setcode.split(".");
    if (setcode[0] == "error") {
        alert("bad setcode");
        return;
    }
    currentSet = "start";
    for (var value of setcode[0].split(",")) {
        addHold(document.getElementById(value));
    }
    currentSet = "finish";
    for (var value of setcode[1].split(",")) {
        addHold(document.getElementById(value));
    }
    currentSet = "hands";
    for (var value of setcode[2].split(",")) {
        addHold(document.getElementById(value));
    }
    currentSet = "feet";
    for (var value of setcode[3].split(",")) {
        addHold(document.getElementById(value));
    }
}

var popup = document.getElementById("info-box");
var popupTitle = document.getElementById("title");
var popupInput = document.getElementById("value")
var popupButton = document.getElementById("popup-button");
var popupExit = document.getElementById("exit");
var saving = false;

document.getElementById("save").addEventListener("click", () => {
    popup.style.display = "flex";
    popupTitle.innerText = "Link to set";
    var code = getSetcode();
    popupInput.value = btoa(`${code}`);
    if (code.split(".")[0] == "error") {
        popupInput.value = `${code.split(".")[1]}`;
        popupButton.disabled = true;
    }
    popupButton.innerText = "Copy to clipboard";
    saving = true;
});

document.getElementById("load").addEventListener("click", () => {
    popup.style.display = "flex";
    popupTitle.innerText = "Enter set code";
    popupInput.value = "";
    popupButton.innerHTML = 'Load Set';
    saving = false;
});

document.getElementById("exit").addEventListener("click", () => {
    popup.style.display = "none";
    popupButton.disabled = false;
});

popupButton.addEventListener("click", () => {
    if (saving) {
        popupInput.select();
        popupInput.setSelectionRange(0, 99999); 
        navigator.clipboard.writeText(popupInput.value);
        popupButton.innerText = "Copied";
    }
});

popupButton.addEventListener("click", () => {
    if (!saving) {
        popup.style.display = "none";
        window.location.href = `/?setData=${popupInput.value}`;
    }
});