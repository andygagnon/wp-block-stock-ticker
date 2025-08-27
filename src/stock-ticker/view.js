// A helper function to fetch data from the Finnhub API
const fetchStockData = async (ticker, apiKey) => {
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;
    const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`;

    try {
        const [quoteResponse, profileResponse] = await Promise.all([
            fetch(quoteUrl),
            fetch(profileUrl)
        ]);

        const quoteData = await quoteResponse.json();
        const profileData = await profileResponse.json();

        if (quoteData.d === 0 || !profileData.name) {
            return { error: "Invalid ticker symbol." };
        }

        return {
            companyName: profileData.name,
            ticker: ticker.toUpperCase(),
            price: quoteData.c.toFixed(2),
            time: new Date().toLocaleTimeString()
        };
    } catch (error) {
        console.error("Error fetching stock data:", error);
        return { error: "Failed to fetch stock data." };
    }
};

// Function to render the stock data into the block element
const renderStockData = (element, data) => {
    if (data.error) {
        element.innerHTML = `<p class="stock-ticker-error">${data.error}</p>`;
        return;
    }

    const html = `
        <div class="stock-ticker-content">
            <h3 class="stock-ticker-company">${data.companyName}</h3>
            <p class="stock-ticker-symbol">
                <span class="stock-ticker-label">Ticker:</span> ${data.ticker}
            </p>
            <p class="stock-ticker-price">
                <span class="stock-ticker-label">Price:</span> $${data.price}
            </p>
            <p class="stock-ticker-time">
                <span class="stock-ticker-label">Last Updated:</span> ${data.time}
            </p>
        </div>
    `;
    element.innerHTML = html;
};

// Find all stock ticker blocks and initialize them
document.addEventListener('DOMContentLoaded', () => {
    const stockTickerBlocks = document.querySelectorAll('.wp-block-create-block-stock-ticker');

    stockTickerBlocks.forEach(block => {
        const ticker = block.dataset.ticker;
        const apiKey = block.dataset.apiKey;

        if (!ticker || !apiKey) {
            block.innerHTML = `<p class="stock-ticker-error">Please set the Ticker Symbol and API Key in the block settings.</p>`;
            return;
        }

        const updateData = async () => {
            const data = await fetchStockData(ticker, apiKey);
            renderStockData(block, data);
        };

        // Initial fetch
        updateData();

        // Refresh data every 10 seconds
        setInterval(updateData, 10000);
    });
});
