const PollWidget = require('./poll-widget');

describe('PollWidget', () => {
    let widget;
    const containerId = '#pollContainer';
    const questions = [{
            question: 'Question 1',
            options: ['Option 1', 'Option 2']
        },
        {
            question: 'Question 2',
            options: ['Option 1', 'Option 2', 'Option 3']
        }
    ];

     let mockEvent;

    beforeEach(() => {
        document.body.innerHTML = `<div id="pollContainer"></div>`;
        widget = new PollWidget(containerId, questions);
        mockEvent = {
            target: document.createElement('div'),
            preventDefault: jest.fn(),
        };
    });

    test('constructor initializes properties correctly', () => {
        expect(widget.container).toBe(document.querySelector(containerId));
        expect(widget.containerId).toBe('pollContainer');
        expect(widget.questions).toBe(questions);
        expect(widget.sessionResponses).toEqual([]);
        expect(widget.totalResponses).toEqual([]);
        expect(widget.optionsPollObject).toEqual({ 0: [0, 0], 1: [0, 0, 0] });
        expect(widget.renderedQuestions.size).toBe(0);
    });

    test('constructor throws error if no element matches the selector', () => {
        expect(() => new PollWidget('#nonexistent', questions)).toThrow();
    });

    test('clearSessionStorage method clears the session storage', () => {
        widget.vote(mockEvent, 0, 0);
        expect(sessionStorage.getItem('poll_responses_pollContainer', JSON.stringify([{"questionIndex":0,"optionIndex":0,"containerId":"pollContainer"}]))).not.toBeNull();
        widget.clearSessionStorage();
        expect(sessionStorage.getItem('poll_responses_pollContainer', JSON.stringify([{"questionIndex":0,"optionIndex":0,"containerId":"pollContainer"}]))).toBeNull();
    });

    test('getSessionResponses method retrieves session responses from sessionStorage', () => {
        const fakeSessionResponses = [{"questionIndex":0,"optionIndex":0,"containerId":"pollContainer"}]
        sessionStorage.setItem('poll_responses_pollContainer' , JSON.stringify(fakeSessionResponses));
        const widgetWithSession = new PollWidget(containerId, questions);
        expect(widgetWithSession.sessionResponses).toEqual(fakeSessionResponses);
    });

    test('render method renders poll elements', () => {
        widget.render();
        const polls = document.querySelectorAll('.poll');
        expect(polls.length).toBe(questions.length);
    });

    test('vote method adds vote to session and total responses, and updates results', () => {
        widget.render();
        const mockEvent = {
            target: document.createElement('div'),
            preventDefault: jest.fn(),
        };
        const mockClosest = jest.fn().mockReturnValue(document.createElement('div'));
        mockEvent.target.closest = mockClosest;

        widget.handleAnimation = jest.fn();
        widget.vote(mockEvent, 0, 0);
        expect(widget.sessionResponses.length).toBe(1);
    });

    test('vote method does not add vote if user has already voted for the question in this session', () => {
        widget.vote(mockEvent, 0, 0);
        widget.vote(mockEvent, 0, 0);
        expect(widget.sessionResponses.length).toBe(1);
        expect(widget.totalResponses.length).toBe(1);
    });

    test('getVotes method returns the correct number of votes', () => {
        widget.vote(mockEvent, 0, 0);
        widget.vote(mockEvent, 1, 1);
        expect(widget.getVotes(0)).toBe(1);
        expect(widget.getVotes(1)).toBe(1);
    });   
});
