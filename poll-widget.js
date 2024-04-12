/**
 * @class
 * @classdesc Represents a PollWidget.
 */
class PollWidget {
    /**
     * @constructor
     * @param {string} containerSelector - The selector for the poll container.
     * @param {Array} questions - The questions for the poll.
     */
    constructor(containerSelector, questions) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            throw new Error(`No element matches the selector: ${containerSelector}`);
        }

        this.containerId = this.container.id;
        this.questions = questions;
        this.sessionResponses = this.getSessionResponses();
        this.totalResponses = this.getTotalResponses();
        this.optionsPollObject = this.initializeOptionsPollObject();
        this.renderedQuestions = new Set();

        // Add this widget to the allWidgets array
        PollWidget.allWidgets.push(this);

        // Clear sessionStorage for all widgets when the page is refreshed
        window.addEventListener('beforeunload', this.clearSessionStorage);
    }

    /**
     * @method
     * @description Clears the session storage.
     */
    clearSessionStorage() {
        PollWidget.allWidgets.forEach(widget => {
            sessionStorage.removeItem('poll_responses_' + widget.containerId);
        });
    }

    /**
     * @method
     * @description Gets the session responses.
     * @returns {Array} The session responses.
     */
    getSessionResponses() {
        return JSON.parse(sessionStorage.getItem('poll_responses_' + this.containerId)) || [];
    }

    /**
     * @method
     * @description Gets the total responses.
     * @returns {Array} The total responses.
     */
    getTotalResponses() {
        return JSON.parse(localStorage.getItem('total_poll_responses_' + this.containerId)) || [];
    }

    initializeOptionsPollObject() {
        const optionsPollObject = {};
        this.questions.forEach((question, index) => {
            optionsPollObject[index] = Array(question.options.length).fill(0);
        });
        return optionsPollObject;
    }

    /**
     * @method
     * @description Renders the poll.
     */
    render() {
        if (this.questions.length === 0) {
            console.log("No questions to render.");
            return;
        }

        const sortedQuestions = [...this.questions].sort((a, b) => a.question.localeCompare(b.question));

        // Check if the poll has already been rendered
        const questionsKey = this.container.id + JSON.stringify(sortedQuestions);

        if (PollWidget.renderedPolls.has(questionsKey)) {
            console.log("This poll has already been rendered!");
            return;
        }

        this.questions.forEach((question, index) => {
            const pollElement = this.createPollElement(question, index);
            this.container.appendChild(pollElement);
            this.renderedQuestions.add(question.question);
        });

        // Add the poll to the renderedPolls map
        PollWidget.renderedPolls.set(questionsKey, this.container.id);
    }

    /**
     * @method
     * @description Creates a poll element.
     * @param {Object} question - The question object.
     * @param {number} index - The index of the question.
     * @returns {HTMLElement} The poll element.
     */
    createPollElement(question, index) {
        const pollWrapper = this.createElement('div', ['poll-wrapper']);
        const pollElement = this.createElement('div', ['poll']);
        const questionElement = this.createElement('p', [], {textContent: question.question});
        pollElement.appendChild(questionElement);
    
        const ul = this.createElement('ul', ['poll-choices']);
        const totalVotes = this.getVotes(index);
    
        question.options.forEach((option, optionIndex) => {
            const li = this.createOption(index, option, optionIndex, totalVotes);
            ul.appendChild(li);
        });
    
        const resultElement = this.createElement('div', ['result'], {'data-question-index': index, textContent: `Total Votes: ${totalVotes}`});
        pollElement.append(ul, resultElement);
        pollWrapper.appendChild(pollElement);
        return pollWrapper;
    }

    createElement(tag, classes = [], attributes = {}, styles = {}) {
        const element = document.createElement(tag);
        this.addClasses(element, classes);
        this.setAttributesAndProperties(element, attributes);
        this.setStyles(element, styles);
        return element;
    }

    addClasses(element, classes) {
        classes.forEach(cls => element.classList.add(cls));
    }

    setAttributesAndProperties(element, attributes) {
        Object.keys(attributes).forEach(attr => {
            if (attr === 'textContent' || attr === 'innerHTML') {
                element[attr] = attributes[attr];
            } else {
                element.setAttribute(attr, attributes[attr]);
            }
        });
    }
    
    setStyles(element, styles) {
        Object.keys(styles).forEach(style => element.style.setProperty(style, styles[style]));
    }

    createOption(index, option, optionIndex, totalVotes) {
        const optionVotes = this.getOptionVotes(index, optionIndex);
        const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;

        const li = this.createElement('li', ['poll-choice', `choice-${optionIndex}`]);
        const label = this.createElement('label', [], {for: `choice-${optionIndex}`});
        const resultDiv = this.createElement('div', ['poll-result'], {}, {'--percent': `${percentage}%`});
        const starDiv = this.createElement('div', ['star'], {innerHTML: '<div></div>'});
        const pollLabelDiv = this.createElement('div', ['poll-label']);
        const radioDiv = this.createElement('div', ['radio']);
        const radioInput = this.createElement('input', [], {type: 'radio', id: `choice-${optionIndex}`, name: 'poll'});
        const answerDiv = this.createElement('div', ['answer'], {textContent: `${option}`});
        const pollPercent = this.createElement('div', ['poll-percent'], {textContent: percentage.toFixed(2)});

        resultDiv.appendChild(starDiv);
        radioDiv.appendChild(radioInput);
        pollLabelDiv.append(radioDiv, answerDiv, pollPercent);
        label.append(resultDiv, pollLabelDiv);
        li.appendChild(label);

        label.addEventListener('click', (e) => this.vote(e,index, optionIndex));

        return li;
    }

    handleAnimation(event, percentages) {  
        const choices = event.target.closest('.poll').querySelectorAll('input[name=poll]');
        if (!choices) {
            console.error('Could not find poll element.');
            return;
        }
        const values = this.distributePercentages(choices.length, percentages);
        this.animatePollChoices(choices, values);
        this.markPollAsAnswered(event.target);
    }

    distributePercentages(choiceCount, percentages) {
        return percentages || Array.from({length: choiceCount}, () => Math.random()).map((n, _, arr) => (n / arr.reduce((a, b) => a + b)) * 100);
    }

    markPollAsAnswered(choice) {
        choice.closest(".poll").classList.add("answered");
    }

    animatePollChoices(choices, values) {
        choices.forEach((choice, i) => {
            const pollChoice = choice.closest(".poll-choice");
            const result = pollChoice.querySelector(".poll-result");
            pollChoice.classList.toggle("winner", values[i] == Math.max(...values));
            result.style.setProperty("--percent", values[i] + "%");
            this.increaseNumber(pollChoice.querySelector(".poll-percent"), values[i]);
        });
    }

    increaseNumber = (node,value) => {
        node.innerText = "0%";
        node.innerText = value + "%";
        this.animateNumber(0,value, 1200,this.easeQuad,function(v) {
          node.innerText = Math.ceil(v) + "%";
        })
    }

    easeQuad(t) {
    return t*t/(2*(t*t-t)+1)
    }

    animateNumber(
    start,
    end,
    duration,
    easingFunction,
    callback 
    ) {
    const startTime = Date.now();
    const endTime = startTime + duration;
    const change = end - start;
    const tick = () => {
        const now = Date.now();
        if (now >= endTime) {
        callback(end);
        } else {
        const elapsed = now - startTime;
        const value = easingFunction(elapsed / duration) * change + start;
        callback(value);
        requestAnimationFrame(tick);
        }
    };
    tick();
    }

    /**
     * @method
     * @description Handles a vote.
     * @param {number} questionIndex - The index of the question.
     * @param {number} optionIndex - The index of the option.
     */
    vote(event,questionIndex, optionIndex) {
        const hasVotedInSession = this.sessionResponses.some(response =>
            response.questionIndex === questionIndex && response.containerId === this.containerId
        );
        if (!hasVotedInSession) {
            this.sessionResponses.push({
                questionIndex,
                optionIndex,
                containerId: this.containerId
            });
            sessionStorage.setItem('poll_responses_' + this.containerId, JSON.stringify(this.sessionResponses));

            this.totalResponses.push({
                questionIndex,
                optionIndex,
                containerId: this.containerId
            });
            localStorage.setItem('total_poll_responses_' + this.containerId, JSON.stringify(this.totalResponses));

            this.updateResults(event, questionIndex);
        } else {
            console.log("You've already voted for this question in this session!");
        }
    }

    /**
     * @method
     * @description Updates the results.
     */
    updateResults(event, questionIndex) {
        const resultElement = this.container.querySelector(`.result[data-question-index="${questionIndex}"]`);
        if (resultElement) {
            const totalVotes = this.getVotes(questionIndex);
            resultElement.textContent = `Votes: ${totalVotes}`;
            
            const choices = resultElement.parentElement.querySelectorAll('.answer');

            let optionsPercentages = this.calculatePercentages(questionIndex, totalVotes, choices);
            this.handleAnimation(event,optionsPercentages)
        }
    }

    calculatePercentages(questionIndex, totalVotes, choices) {
        let optionsPercentages = [];
        choices.forEach((value) => {
            const optionIndex = parseInt(value.parentElement.querySelector('input[type="radio"]').id.split('-')[1]);
            const optionVotes = this.getOptionVotes(questionIndex, optionIndex);
            const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
            value.textContent = `${value.textContent.split('(')[0]}`;
            optionsPercentages.push(percentage.toFixed(2))
        });
        return optionsPercentages
    }

    /**
     * @method
     * @description Gets the votes for a question.
     * @param {number} questionIndex - The index of the question.
     * @returns {number} The number of votes.
     */
    getVotes(questionIndex) {
        const questionResponses = this.totalResponses.filter(response => 
            response.questionIndex === questionIndex && response.containerId === this.containerId
        );
        return questionResponses.length;
    }

    getOptionVotes(questionIndex, optionIndex) {
        const questionResponses = this.totalResponses.filter(response =>
            response.questionIndex === questionIndex &&
            response.optionIndex === optionIndex &&
            response.containerId === this.containerId
        );
        return questionResponses.length;
    }
}

PollWidget.renderedPolls = new Map();
// static property to hold all widgets
PollWidget.allWidgets = [];

module.exports = PollWidget;