var digitCount = 3;

window.onload = function(){
    Array.from(document.getElementsByClassName("field")).forEach((elem, i) => {
        elem.ondragover = (evt) => {
            if (elem.children.length == 0 || elem.classList.contains("multihold")){
                evt.preventDefault();
                elem.classList.add("draggedover");
            }
        };
        elem.ondragleave = (evt) => {
            elem.classList.remove("draggedover");
        };
        elem.ondrop = (evt) => {
            var dasElement = document.getElementById(evt.dataTransfer.getData("text/html"));
            elem.appendChild(dasElement);
            elem.classList.remove("draggedover");
            checkMathTime(elem.parentNode);
        };
    });

    document.getElementById("math-add").onFieldsFilled = (values) => {
        return values[0] + values[1];
    };

    document.getElementById("math-sub").onFieldsFilled = (values) => {
        if (values[0] - values[1] < 0){
            return;
        }
        return values[0] - values[1];
    };

    document.getElementById("math-div").onFieldsFilled = (values) => {
        var divved = values[0]/values[1];
        if (Math.round(divved) == divved){ // If it without the decimal place is equivalent to it with the decimal place, e.g. the decimal place is 0 and the number is whole
            return divved;
        }
    };

    document.getElementById("math-mul").onFieldsFilled = (values) => {
        return values[0] * values[1];
    };

    document.getElementById("math-sqrt").onFieldsFilled = (values) => {
        var rooted = Math.sqrt(values[0]);
        if (Math.floor(rooted) == rooted){ // It's a perfect square
            return rooted;
        }
    };

    document.getElementById("math-squ").onFieldsFilled = (values) => {
        return values[0] * values[0];
    };

    genNumbers(digitCount);
    digitCount ++;
    document.getElementById("level").innerText = digitCount - 3;
};

function getRandomOneNine(){
    return Math.floor(Math.random() * 9) + 1;
}

function getRandomInt(min, max) { /* Thanks, MDN */
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper functions. I'm translating from my (original) Python code, I don't want to put in the effort to understand why or how they work
function makeAddition(n){
    var m = getRandomInt(0, n);
    return [m, n - m];
}

function makeSubtraction(n){
    var m = getRandomInt(0, n);
    return [m, n + m];
}

function makeDivision(n){
    var m = getRandomInt(1, Math.floor(9/n));
    if (m == 1){
        return [n]; // Don't allow unnecessary 1s, they make it too easy
    }
    return [m * n, m];
}

function makeSqrt(n){
    if (n * n > 256){
        return [n];
    }
    return [n * n];
}

function makeMultiplication(n){
    var divisibles = [];
    if (n == 1){
        return [1];
    }
    for (var i = 1; i < n; i ++){
        if (Math.round(n/i) == n/i){
            divisibles.push(i);
        }
    }
    var m = divisibles[Math.floor(Math.random() * divisibles.length)];
    if (m == 1){
        return [n]; // Don't allow unnecessary 1s, they make it too easy
    }
    return [n/m, m]; // Allow *some* ones
}

function processOneNumber(number){
    var choice = Math.random();
    if (choice < 0.16){
        return makeAddition(number);
    }
    else if (choice < 0.32){
        return makeSubtraction(number);
    }
    else if (choice < 0.48){
        return makeDivision(number);
    }
    else if (choice < 0.64){
        return makeMultiplication(number);
    }
    else if (choice < 0.8){
        return makeSqrt(number);
    }
    return [number];
}

function extrapolateFrom(nums, length){
    var ret = [];
    nums.forEach((number, i) => {
        var d = processOneNumber(number);
        if (ret.length + d.length > length){
            ret.push(number);
        }
        else{
            ret.push(...d);
        }
    });
    return ret.filter(element => element != 0);
}

function genNumbers(length){ /* Known solvable algorithm */
    var m = getRandomOneNine();
    var active = [m, m];
    while (active.length < length){
        console.log(active);
        active = extrapolateFrom(active, length);
    }
    console.log(active);
    active.forEach((item, i) => {
        setTimeout(() => {
            newNumber(item);
        }, 500);
    });
}


var newNumIndex = 0;

function newNumber(amount){
    if (amount == 0){
        return;
    }
    newNumIndex ++;
    var el = document.createElement("div");
    el.classList.add("number");
    el.classList.add("needsShrinkdown");
    el.addEventListener("animationend", () => {
        el.classList.remove("needsShrinkdown");
    });
    el.draggable = "true";
    el.id = "num_" + newNumIndex;
    el.ondragstart = (evt) => {
        evt.dataTransfer.setData("text/html", el.id);
    };
    el.innerText = amount;
    document.getElementById("numbers").appendChild(el);
}

function checkMathTime(el){
    var isMathy = true;
    var fieldData = [];
    Array.from(el.children).forEach((field, i) => {
        if (!field.classList.contains("field")){
            return;
        }
        if (field.children.length == 0){
            isMathy = false;
        }
        else{
            fieldData.push(field.children[0].innerText - 0);
        }
    });
    if (isMathy){
        if (el.onFieldsFilled){
            var v = el.onFieldsFilled(fieldData);
            if (v != undefined){
                newNumber(v);
                Array.from(el.children).forEach((item, i) => {
                    if (item.classList.contains("field")){
                        item.children[0].parentNode.removeChild(item.children[0]);
                    }
                });
            }
        }
    }
    if (document.getElementsByClassName("number").length == 0){
        alert("You win!");
        genNumbers(digitCount);
        digitCount ++;
        document.getElementById("level").innerText = digitCount - 3;
    }
}

// My code is messy. Am I going to fix it? No. I don't care enough.
// Not yet.

document.body.onkeyup = function(evt){
    if (evt.key == "f"){
        document.body.requestFullscreen();
    }
};

function reset(){
    Array.from(document.getElementsByClassName("number")).forEach((item, i) => {
        item.parentNode.removeChild(item);
    });
    genNumbers(digitCount - 1);
}
