const PollWidget = require('./poll-widget');

describe('PollWidget', () => {
    let pollWidget;

    beforeEach(() => {
        const container = document.createElement('div');
        container.id = 'poll-container';
        document.body.appendChild(container);

        const questions = [
            {
                question: "How you feel today:",
                options: ["Great", "Okay", "Not so good"]
            }
        ];
        pollWidget = new PollWidget("#poll-container", questions);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('Render poll correctly', () => {
        pollWidget.render();
        const pollElement = document.querySelector('.poll');
        expect(pollElement).not.toBeNull();
    });

    test('Vote increments vote count', () => {
        pollWidget.render();
        const optionElement = document.querySelectorAll('.option')[0];
        optionElement.click();
        const resultElement = document.querySelector('.result');
        expect(resultElement.textContent).toContain('Votes: 1');
    });

    test('Update results after voting', () => {
        pollWidget.render();
        const optionElement = document.querySelectorAll('.option')[0];
        optionElement.click();
        const resultElement = document.querySelector('.result');
        expect(resultElement.textContent).toContain('Votes: 1');
    });
});
