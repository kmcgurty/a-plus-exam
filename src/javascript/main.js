(function() {
    var QUESTION_DATA;
    var MAX_QUESTIONS = 25;

    $.getJSON("./javascript/901questions.json")
        .done(function(data) {
            QUESTION_DATA = data.d;

            shuffle(QUESTION_DATA);

            parseQs();
            addListeners();
        })
        .fail(function(e) {
            console.log("fail");
            if (e.status == 200) {
                alert("error: invalid json")
            }
        });

    function parseQs() {
        var container = document.getElementById("exam-container");

        for (var i = 0; i < MAX_QUESTIONS; i++) {
            shuffle(QUESTION_DATA[i].choices);

            var element = document.createElement("div");

            var qNum = document.createElement("div");

            var qContainer = document.createElement("div");
            var question = document.createElement("div");
            var aContainer = document.createElement("div");


            qNum.className = "question-number";
            qContainer.className = "question-container";
            aContainer.className = "answer-container";


            qNum.innerHTML = (i + 1) + ".";

            if (i % 2 == 0) {
                element.className = "even";
            } else {
                element.className = "odd";
            }

            question.className = "q";
            question.setAttribute("data-qnum", i)
            question.innerHTML = QUESTION_DATA[i].q;

            for (var j = 0; j < QUESTION_DATA[i].choices.length; j++) {
                var aElem = document.createElement("span")
                var radioElem = document.createElement("input")
                var labelElem = document.createElement("label")

                aElem.className = "a";
                aElem.setAttribute("data-cnum", j) //data-cnum is used for grading
                aElem.appendChild(radioElem);
                aElem.appendChild(labelElem);


                if (parseInt(QUESTION_DATA[i].answers) > 1) {
                    radioElem.setAttribute("type", "checkbox");
                } else {
                    radioElem.setAttribute("type", "radio");
                }

                radioElem.setAttribute("name", "q" + i); //radio buttons named the same so more than one cannot be selected
                radioElem.setAttribute("id", "q" + i + "a" + j) //radio buttons need to be marked uniquely for labels

                labelElem.setAttribute("for", "q" + i + "a" + j) //labels set for radio buttons
                labelElem.innerHTML = QUESTION_DATA[i].choices[j].txt;

                aContainer.appendChild(aElem);
            }


            qContainer.appendChild(question);
            qContainer.appendChild(aContainer);

            element.appendChild(qNum);

            element.appendChild(qContainer);
            container.appendChild(element);
        }
    }


    function addListeners() {
        document.addEventListener('click', function(e) {
            if (e.target.value == "Submit") {
                grade();
            }
        });
    }

    //needs work, is gay
    function grade() {
    	var points = 0;

        for (var i = 0; i < MAX_QUESTIONS; i++) {
            var answers = getAFromQ(i);

            for (var j = 0; j < answers.length; j++) {
                var radio = document.querySelector("#q" + i + "a" + answers[j]);

                if (radio.checked) {
                    radio.parentElement.className = "a correct";
                    points += parseInt(QUESTION_DATA[i].choices[answers[j]].pnts);
                } else if (!radio.checked) {
                    radio.parentElement.className = "a incorrect";
                }
            }
        }

        console.log(points);
    }


    function getAFromQ(questionNum) {
        var answers = [];

        for (var i = 0; i < QUESTION_DATA[questionNum].choices.length; i++) {
            var currRadio = document.querySelector("#q" + questionNum + "a" + i);
            var currAns = currRadio.parentElement;

            var currQ = parseInt(currAns.parentElement.parentElement.querySelector(".q").getAttribute("data-qnum"));
            var currA = parseInt(currAns.getAttribute("data-cnum"));

            var points = parseInt(QUESTION_DATA[currQ].choices[currA].pnts);

            if (points > 0) { //correct answer
                answers.push(currA);
            }
        }

        return answers
    }

    function checkAns(e) { //e == click event
        var qElement = e.target.parentElement.parentElement.querySelector(".q");
        var cElement = e.target;

        var answered = qElement.parentElement.className.includes("answered");

        if (e.target.className == "a" && !answered) {
            var i = qElement.getAttribute("data-qnum");
            var j = cElement.getAttribute("data-cnum");

            var currQ = QUESTION_DATA[i].q;
            var currA = QUESTION_DATA[i].choices[j].txt;
            var correct = QUESTION_DATA[i].choices[j].pnts != 0;

            if (correct) {
                cElement
            } else {
                cElement.className = "a incorrect"
            }
        }
    }

    //thanks to https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    function shuffle(array) {
        var currentIndex = array.length,
            temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }
})();