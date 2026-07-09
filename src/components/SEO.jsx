import React, { useEffect } from 'react';

const SEO = ({ title, description }) => {
    useEffect(() => {
        // Update Document Title
        document.title = title;

        // Update Meta Description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', description);
        } else {
            const newMeta = document.createElement('meta');
            newMeta.name = 'description';
            newMeta.content = description;
            document.head.appendChild(newMeta);
        }

        // Update Open Graph Title & Description
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', title);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', description);

    }, [title, description]);

    return null;
};

export default SEO;
