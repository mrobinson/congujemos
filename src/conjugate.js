class Options {
    constructor(elementToHideAndShow, container) {
        this.elementToHideAndShow = elementToHideAndShow;
        this.container = container;

        this.read();

        if (!this.activeMoodsAndTenses) {
            this.activeMoodsAndTenses = Array(Conjugate.moodsAndTenses.length);
            this.activeMoodsAndTenses.fill(true);
        }

        if (!this.timeout) {
            this.timeout = 20 * 1000; // 20 seconds
        }

        this.buildOptionsDialog();
    }

    moodAndTenseChanged(index, event) {
        var event = Conjugate.getEvent(event);
        this.activeMoodsAndTenses[index] = event.target.checked;
    }

    hide() {
        this.elementToHideAndShow.style.display = "none";
        this.write();
    }

    show() {
        this.elementToHideAndShow.style.display = "block";
    }

    buildOptionsDialog() {
        var self = this;
        function addMood(mood) {
            var outerDiv = document.createElement('div');
            outerDiv.className = "mood_section";

            var header = document.createElement("h2");
            header.innerText = mood;
            outerDiv.appendChild(header);

            Conjugate.moodsAndTenses.forEach(function(moodAndTense, index) {
                if (moodAndTense[2] != mood) {
                    return;
                }

                var check = document.createElement('input');
                check.type = 'checkbox';
                if (self.activeMoodsAndTenses[index])
                    check.checked = 'true';

                check.addEventListener("change", self.moodAndTenseChanged.bind(self, index));

                outerDiv.appendChild(check);
                outerDiv.appendChild(document.createTextNode(moodAndTense[1]));

                outerDiv.appendChild(document.createElement('br'));
            });
            return outerDiv;
        }

        var moodAndTensesContainer = document.createElement('div');
        moodAndTensesContainer.className = "mood_and_tenses";
        moodAndTensesContainer.appendChild(addMood("Indicative"));
        moodAndTensesContainer.appendChild(addMood("Subjunctive"));
        moodAndTensesContainer.appendChild(addMood("Imperative"));
        this.container.appendChild(moodAndTensesContainer);

        var closeButton = document.createElement("input");
        closeButton.type = "button";
        closeButton.value = "Close";
        closeButton.addEventListener("click", self.hide.bind(self));
        this.container.appendChild(closeButton);
    }

    write() {
        localStorage.setItem("activeMoodsAndTenses", JSON.stringify(this.activeMoodsAndTenses));
        localStorage.setItem("timeout", JSON.stringify(this.timeout));
    }

    read() {
        function readAndTryToParse(key) {
            var value = localStorage.getItem(key);
            if (!value)
                return null;
            try {
                return JSON.parse(value);
            } catch (error) {
                return null;
            }
        }

        var activeMoodsAndTenses = readAndTryToParse("activeMoodsAndTenses");
        if (activeMoodsAndTenses)
            this.activeMoodsAndTenses = activeMoodsAndTenses;
        var timeout = readAndTryToParse("timeout");
        if (timeout)
            this.timeout = timeout;
    }
}

class Conjugate {
    constructor(options,
                inputBoxElement,
                correctAnswerBoxElement,
                wordElement,
                definitionElement,
                conjugationTextElement,
                timerFillElement) {

        this.options = options;

        this.inputBoxElement = inputBoxElement;
        this.correctAnswerBoxElement = correctAnswerBoxElement;
        this.wordElement = wordElement;
        this.definitionElement = definitionElement;
        this.conjugationTextElement = conjugationTextElement;
        this.timerFillElement = timerFillElement

        this.inTestingMode = false;
        this.animationFrame = null;
        this.animationStart = null;

        var keyHandler = this.keyPress.bind(this);
        this.inputBoxElement.addEventListener("keypress", keyHandler, false);
        document.body.addEventListener("keypress", keyHandler, false);
    }

    generateRandomConjugationTest() {
        var keys = Object.keys(__WORDS__);
        var verb = keys[Math.floor(Math.random() * keys.length)];
        var verbArray = __WORDS__[verb];

        var moodAndTenseIndices = [];
        this.options.activeMoodsAndTenses.forEach(function(active, index) {
            if (active)
                moodAndTenseIndices.push(index);
        });
        var moodAndTenseIndex =
            moodAndTenseIndices[Math.floor(Math.random() * moodAndTenseIndices.length)];

        var personAndNumberIndex = Math.floor(Math.random() * Conjugate.personAndNumber.length);

        return {
            verb: verb,
            definition: verbArray[0],
            conjugatedVerb: verbArray[1 + (Conjugate.moodsAndTenses[moodAndTenseIndex][0] * 6) +
                                          Conjugate.personAndNumber[personAndNumberIndex][0]],
            tense: Conjugate.moodsAndTenses[moodAndTenseIndex][1],
            mood: Conjugate.moodsAndTenses[moodAndTenseIndex][2],
            personAndNumberText: Conjugate.personAndNumber[personAndNumberIndex][1],
        }
    }

    startTesting() {
        if (this.animationFrame !== null)
            cancelAnimationFrame(this.animationFrame);

        this.animationHandler = function(timestamp) {
            if (this.animationStart == null) {
                this.animationStart = timestamp;
            }

            var percentDone =
                Math.min(((timestamp - this.animationStart) / Conjugate.timeout) * 100, 100);
            this.timerFillElement.style.width = (100 - percentDone) + "%";

            if (percentDone == 100) {
                this.checkConjugation();
                return;
            }

            this.animationFrame = requestAnimationFrame(this.animationHandler);
        }.bind(this);

        this.animationStart = null;
        this.animationFrame = requestAnimationFrame(this.animationHandler);
        this.inTestingMode = true;
    }

    animationTick() {

    }

    stopTesting() {
        if (this.animationFrame !== null)
            cancelAnimationFrame(this.animationFrame);
        this.inTestingMode = false;
    }

    chooseNewConjugation() {
        var conjugationTest = this.generateRandomConjugationTest();
        while (conjugationTest.conjugatedVerb == '') {
            conjugationTest = this.generateRandomConjugationTest();
        }

        this.wordElement.innerText = conjugationTest.verb;
        this.definitionElement.innerText = "(" + conjugationTest.definition + ")";
        this.conjugationTextElement.innerHTML =
            conjugationTest.tense +
            "<br/>" + conjugationTest.mood +
            "<br/>in the " + conjugationTest.personAndNumberText + " form";
        window.__ANSWER__ = conjugationTest.conjugatedVerb;
        console.log(conjugationTest.conjugatedVerb);

        this.inputBoxElement.innerText = "";
        this.inputBoxElement.className = "wordbox noanswer";
        this.inputBoxElement.setAttribute('contenteditable', 'true');
        this.inputBoxElement.focus();

        this.correctAnswerBoxElement.innerText = "blank";
        this.correctAnswerBoxElement.style.visibility = "hidden";

        this.startTesting();
    }

    checkConjugation() {
        if (this.inputBoxElement.innerText == __ANSWER__)
            this.inputBoxElement.className = "wordbox correct phaseout";
        else {
            this.inputBoxElement.className = "wordbox incorrect phaseout";
            this.correctAnswerBoxElement.innerText = __ANSWER__;
            this.correctAnswerBoxElement.style.visibility = "";
        }
        this.inputBoxElement.removeAttribute('contenteditable');

        this.stopTesting();
    }

    static getEvent(event) {
        if (!event)
            return window.event;
        return event;
    }

    keyPress(event) {
        var event = Conjugate.getEvent(event);
        if (event.keyCode == 13) {
            event.preventDefault();
            event.stopPropagation();

            if (this.inTestingMode) {
                this.checkConjugation();
            } else {
                this.chooseNewConjugation();
            }
        }

        return false;
    }

    static start() {
        var options = new Options(document.getElementById('options_wrapper'),
                                  document.getElementById('options'));
        Conjugate.__instance__ = new Conjugate(
            options,
            document.getElementById('inputbox'),
            document.getElementById('answerbox'),
            document.getElementById('word'),
            document.getElementById('definition'),
            document.getElementById('conjugation'),
            document.getElementById('timerguts'));
        Conjugate.__instance__.chooseNewConjugation();
    }

    static showOptions() {
        Conjugate.__instance__.options.show();
    }
}

Conjugate.timeout = 20 * 1000; // 5 seconds
Conjugate.moodsAndTenses = [
    [0, "Present", "Indicative"],
    [1, "Future", "Indicative"],
    [2, "Imperfect", "Indicative"],
    [3, "Preterite", "Indicative"],
    [4, "Conditional", "Indicative"],
    [5, "Present Perfect", "Indicative"],
    [6, "Future Perfect", "Indicative"],
    [7, "Past Perfect", "Indicative"],
    // [8, "Preterite (Archaic)", "Indicative"],
    [9, "Conditional Perfect", "Indicative"],
    [10, "Present", "Subjunctive"],
    [11, "Imperfect", "Subjunctive"],
    [12, "Future", "Subjunctive"],
    [13, "Present Perfect", "Subjunctive"],
    [14, "Future Perfect", "Subjunctive"],
    [15, "Past Perfect", "Subjunctive"],
    [16, "Affirmative", "Imperative"],
    [17, "Negative", "Imperative"],
];

Conjugate.personAndNumber = [
    [0, "yo"],
    [1, "tú"],
    [2, "él/ella/usted"],
    [3, "nosotros"],
    [4, "vosotros"],
    [5, "ellos/ellas/ustedes" ],
];
