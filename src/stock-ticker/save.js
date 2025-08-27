import { useBlockProps } from '@wordpress/block-editor';

const Save = ({ attributes }) => {
    const blockProps = useBlockProps.save({
        'data-ticker': attributes.ticker,
        'data-api-key': attributes.api_key,
    });

    return (
        <div {...blockProps}>
            {/* The front-end script (view.js) will populate this container */}
            <p className="stock-ticker-placeholder">Loading stock data...</p>
        </div>
    );
};

export default Save;
