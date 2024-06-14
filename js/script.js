document.addEventListener('DOMContentLoaded', (event) => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const startButton = document.getElementById('start-conversation');
    const stopButton = document.getElementById('stop-conversation');
    const recordButton = document.getElementById('record-conversation');
    const categorySelect = document.getElementById('category');
    const conversationTextarea = document.getElementById('conversation');
    const recordedContentDiv = document.getElementById('recorded-content');
    const realTimeAnalysisDiv = document.getElementById('real-time-analysis');

    let conversationText = '';

    startButton.addEventListener('click', () => {
        recognition.start();
        startButton.disabled = true;
        stopButton.disabled = false;
    });

    stopButton.addEventListener('click', () => {
        recognition.stop();
        startButton.disabled = false;
        stopButton.disabled = true;
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        conversationTextarea.value += transcript + '\n';
    };

    recognition.onend = () => {
        if (startButton.disabled) {
            recognition.start();
        }
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

            callChatGPTAPI(conversation, category);
        }
    });

    async function callChatGPTAPI(conversation, category) {
        const apiKey = 'KEY'; // 実際のAPIキーをここに入れる
        const apiUrl = 'https://api.openai.com/v1/chat/completions'; // 正しいエンドポイント
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}` // ここでAPIキーをヘッダーに設定
        };

        // 症状から考えられる要因を問い合わせるプロンプトを生成
        const prompt = `連続するコメントの流れに沿って、会話中の不足情報の補完、病気の予測、必要情報を収集するための追加質問をする: ${category} - ${conversation}`;

        const data = {
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 500, // ここでトークンの最大値を増やす
            temperature: 0.7
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTPエラー! ステータス: ${response.status}`);
            }

            const result = await response.json();
            console.log(result); // APIレスポンスをログに出力

            if (result.choices && result.choices.length > 0) {
                const completionText = result.choices[0].message.content.trim(); // テキストを取得
                console.log(completionText);
                realTimeAnalysisDiv.innerHTML = `<p>${completionText}</p>`;
            } else {
                throw new Error('レスポンスに選択肢が見つかりません');
            }
        } catch (error) {
            console.error('エラー:', error);
        }
    }
});
