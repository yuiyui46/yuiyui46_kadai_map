document.addEventListener('DOMContentLoaded', (event) => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const startButton = document.getElementById('start-conversation');
    const recordButton = document.getElementById('record-conversation');
    const categorySelect = document.getElementById('category');
    const conversationTextarea = document.getElementById('conversation');
    const recordedContentDiv = document.getElementById('recorded-content');
    const conversationCompletionDiv = document.getElementById('conversation-completion');
    const questionGenerationDiv = document.getElementById('question-generation');
    const realTimeAnalysisDiv = document.getElementById('real-time-analysis');
    const autoSummaryDiv = document.getElementById('auto-summary');

    let conversationText = '';

    startButton.addEventListener('click', () => {
        recognition.start();
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        conversationTextarea.value += transcript + '\n';
    };

    recordButton.addEventListener('click', () => {
        const category = categorySelect.value;
        const conversation = conversationTextarea.value.trim();

        if (conversation) {
            const recordedItem = document.createElement('div');
            recordedItem.className = 'recorded-content';
            recordedItem.innerHTML = `<h3>${category}</h3><p>${conversation}</p>`;
            recordedContentDiv.appendChild(recordedItem);
            
            conversationText += conversation + '\n';
            conversationTextarea.value = '';

            callChatGPTAPI(conversation);
        }
    });

    async function callChatGPTAPI(conversation) {
        const apiKey = '';
        const apiUrl = 'https://api.openai.com/v1/chat/completions'; // 修正されたエンドポイント
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };

        const data = {
            model: 'gpt-4', // 使用するモデル
            messages: [{ role: 'user', content: conversation }], // 会話のメッセージ形式
            max_tokens: 150,
            n: 1,
            stop: null,
            temperature: 0.7
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(result); 

            if (result.choices && result.choices.length > 0) {
                const completionText = result.choices[0].message.content.trim(); // メッセージ内容を取得
                console.log('Completion Text:', completionText);
                generateCompletion(completionText);
                generateQuestions(completionText);
                analyzeConversation(completionText);
                summarizeConversation(conversationText);
            } else {
                throw new Error('No choices found in the response');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }


    function generateQuestions(completion) {
        const questions = ['この点について詳しく教えてください。', '他に何か気になる点はありますか？'];
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        questionGenerationDiv.innerText = `追加質問: ${randomQuestion}`;
    }

    function analyzeConversation(completion) {
        const analysis = `分析結果: 会話は順調に進行しています。`;
        realTimeAnalysisDiv.innerText = analysis;
    }

    function summarizeConversation(conversation) {
        const summary = `要約: ${conversation.substring(0, 100)}...`;
        autoSummaryDiv.innerText = summary;
    }
});
