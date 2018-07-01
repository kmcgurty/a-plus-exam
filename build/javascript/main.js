(function() {
    var QUESTION_DATA;
    const MAX_QUESTIONS = 25;

    //var minLoadTime = 1000;
    var minLoadTime = 1000;
    var startTime = Date.now();

    var lastVisit = Cookies.get("last_visit");
    console.log(!lastVisit);
    var toShuffle = !lastVisit; //shuffle if haven't visited before

    var saveOnReload = true;

    var qBankPath = "./javascript/901questions.json";


    $.getJSON(qBankPath)
        .done(function(data) {
            var currTime = Date.now();
            var loadTime = (currTime - startTime);
            minLoadTime -= loadTime;

            if (lastVisit === undefined) { //first visit
                QUESTION_DATA = data.d;
            } else { //has visited in the past 7 days
                QUESTION_DATA = JSON.parse(localStorage.lastSession);

            }

            if (toShuffle) {
                shuffle(QUESTION_DATA);
            }

            //give some time to appreciate mr. loader duck
            setTimeout(function() {
                finishLoading(); // hide duck, make everything behind it visible
                appendHTML(); //add questions to the page
                loadSession(); //restore 
                addListeners(); //add click listeners
                //saveSession(); //save the session via cookies
            }, minLoadTime);
        })
        .fail(function(e) {
            console.log("fail");
            if (e.status == 200) {
                alert("error: invalid json")
            }
        });

    function appendHTML() {
        var container = document.getElementById("exam-container");

        for (var i = 0; i < MAX_QUESTIONS; i++) {
            var lastVisit = new Date(Cookies.get("last_visit"));

            if (toShuffle) {
                shuffle(QUESTION_DATA[i].choices);
            };

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


    function finishLoading() {
        var loader = document.querySelector("#loader");
        var deleteTime = 3000;

        loader.className = "hide";

        document.querySelector(".title").className = "title show";
        document.querySelector("#exam-container").className = "show";
        document.querySelector(".button-group").className = "button-group show";

        setTimeout(function() {
            loader.style.display = "none";
        }, deleteTime);
    }


    function addListeners() {
        document.addEventListener('click', function(e) {
            if (e.target.value == "Submit") {
                gradeExam();
            }

            if (e.target.value == "Save") {
                saveSession();
                toast("Progress saved.");
            }

            if (e.target.value == "Reset") {
                clearSession();
            }

            if (e.target.type == "radio") {
                saveSession();
            }
        });

        window.addEventListener("beforeunload", function(e) {
            if (saveOnReload) {
                saveSession();
            }
            event.preventDefault();
        });

    }

    function gradeExam() {
        var points = 0;

        for (var i = 0; i < MAX_QUESTIONS; i++) {
            var answers = getAnswers(i);


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

        alert("Your score: " + points + "/" + MAX_QUESTIONS + " or " + round((points / MAX_QUESTIONS) * 100) + "%");
    }

    function saveSession() {
        Cookies.set("last_visit", Date.now(), { expires: 7, path: '' });

        localStorage.lastSession = JSON.stringify(QUESTION_DATA);

        var userAnswers = [];

        for (var i = 0; i < MAX_QUESTIONS; i++) {
            for (var j = 0; j < QUESTION_DATA[i].choices.length; j++) {
                var radio = document.querySelector("#q" + i + "a" + j);

                if (radio.checked) {
                    userAnswers.push({ "q": i, "selection": j });
                }
            }
        }

        console.log(userAnswers);

        localStorage.savedSelections = JSON.stringify(userAnswers);

    }

    function clearSession() {
        var reload = confirm("Are you sure you want to reset? All answers will be removed and questions will randomize.");

        if (reload) {
            localStorage.removeItem("lastSession");
            localStorage.removeItem("savedSelections");
            Cookies.remove('last_visit', { path: '' });

            saveOnReload = false;

            location.reload();
        }
    }

    function loadSession() {
        var savedSelections = localStorage.savedSelections;

        if (savedSelections != undefined) {
            savedSelections = JSON.parse(savedSelections);

            for (var i = 0; i < savedSelections.length; i++) {
                var q = savedSelections[i].q;
                var a = savedSelections[i].selection;

                document.querySelector("#q" + q + "a" + a).checked = true;
            }
        }
    }

    //due to how the answers are stored in the json
    //this function cycles through the choices to find the answers
    //returns array of answers
    function getAnswers(questionNum) {
        var answers = [];

        for (var i = 0; i < QUESTION_DATA[questionNum].choices.length; i++) {
            var currRadio = document.querySelector("#q" + questionNum + "a" + i);
            var currAns = currRadio.parentElement;

            var currQ = parseInt(currAns.parentElement.parentElement.querySelector(".q").getAttribute("data-qnum"));
            var currA = parseInt(currAns.getAttribute("data-cnum"));

            var points = Number(QUESTION_DATA[currQ].choices[currA].pnts);

            if (points > 0) { //correct answer
                answers.push(currA);
            }
        }

        return answers
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

    function toast(message) {
        console.log(message);
        var duration = 2000;
        var elem = document.querySelector("#toast");

        console.log(elem);

        elem.innerHTML = message;

        elem.className = "show";

        setTimeout(function() {
            elem.className = "hide";
        }, duration)
    }


    function round(num) {
        return Math.round(num * 100) / 100
    }
})();