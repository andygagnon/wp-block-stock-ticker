/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Spinner } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import './editor.scss';

// A helper function to fetch data from the Finnhub API
const fetchStockData = async (ticker, apiKey) => {
    // Return mock data for the editor environment to avoid excessive API calls
    if (document.body.className.includes('is-admin')) {
        return {
            companyName: 'Alphabet Inc. Class A',
            ticker: 'GOOGL',
            price: (1500 + Math.random() * 50).toFixed(2),
            time: new Date().toLocaleTimeString()
        };
    }

    // Replace with your actual Finnhub API URL
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
            throw new Error("Invalid ticker symbol.");
        }

        return {
            companyName: profileData.name,
            ticker: ticker.toUpperCase(),
            price: quoteData.c.toFixed(2),
            time: new Date().toLocaleTimeString()
        };
    } catch (error) {
        console.error("Error fetching stock data:", error);
        return {
            error: error.message || "Failed to fetch stock data."
        };
    }
};

const Edit = ({ attributes, setAttributes }) => {
    const { ticker, api_key } = attributes;
    const [stockData, setStockData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // This useEffect hook handles the initial data fetch and the refresh interval
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setIsLoading(true);
            const data = await fetchStockData(ticker, api_key);
            if (isMounted) {
                setStockData(data);
                setIsLoading(false);
            }
        };

        fetchData();

        // Set up an interval to refresh the data every 10 seconds
        const intervalId = setInterval(fetchData, 10000);

        // Cleanup function to clear the interval when the component unmounts
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [ticker, api_key]);

    const blockProps = useBlockProps();

    return (
        <>
            <InspectorControls>
                <PanelBody title="Stock Ticker Settings">
                    <TextControl
                        label="Ticker Symbol (e.g., GOOGL)"
                        value={ticker}
                        onChange={(newTicker) => setAttributes({ ticker: newTicker.toUpperCase() })}
                    />
                    <TextControl
                        label="Finnhub API Key"
                        value={api_key}
                        onChange={(newKey) => setAttributes({ api_key: newKey })}
                        help="Enter your Finnhub API key here."
                    />
                </PanelBody>
            </InspectorControls>
            <div {...blockProps}>
                {isLoading ? (
                    <div className="stock-ticker-loading">
                        <Spinner />
                        <span>Loading...</span>
                    </div>
                ) : stockData?.error ? (
                    <div className="stock-ticker-error">
                        <p>{stockData.error}</p>
                    </div>
                ) : (
                    <div className="stock-ticker-content">
                        <h3 className="stock-ticker-company">{stockData?.companyName}</h3>
                        <p className="stock-ticker-symbol">
                            <span className="stock-ticker-label">Ticker:</span> {stockData?.ticker}
                        </p>
                        <p className="stock-ticker-price">
                            <span className="stock-ticker-label">Price:</span> ${stockData?.price}
                        </p>
                        <p className="stock-ticker-time">
                            <span className="stock-ticker-label">Last Updated:</span> {stockData?.time}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default Edit;
