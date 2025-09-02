/**
 * Enhanced Code Block Copy Functionality
 * Provides copy-to-clipboard functionality for code blocks with improved UX
 */

(function() {
    'use strict';

    // Initialize copy functionality when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCodeCopy);
    } else {
        initCodeCopy();
    }

    function initCodeCopy() {
        // Add click listeners to all code blocks
        const codeBlocks = document.querySelectorAll('.highlight');
        codeBlocks.forEach(addCopyFunctionality);

        // Handle dynamically added code blocks
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.matches('.highlight')) {
                            addCopyFunctionality(node);
                        } else {
                            const highlights = node.querySelectorAll('.highlight');
                            highlights.forEach(addCopyFunctionality);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function addCopyFunctionality(codeBlock) {
        // Avoid duplicate event listeners
        if (codeBlock.dataset.copyEnabled) return;
        codeBlock.dataset.copyEnabled = 'true';

        codeBlock.addEventListener('click', function(event) {
            // Check if click is on the copy button area
            const rect = codeBlock.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

            // Copy button is in top-right corner (roughly 80px x 40px area)
            if (clickX > rect.width - 80 && clickY < 40) {
                event.preventDefault();
                copyCodeToClipboard(codeBlock);
            }
        });

        // Add keyboard support
        codeBlock.addEventListener('keydown', function(event) {
            if ((event.ctrlKey || event.metaKey) && event.key === 'c' &&
                event.target === codeBlock) {
                event.preventDefault();
                copyCodeToClipboard(codeBlock);
            }
        });

        // Make code block focusable for keyboard navigation
        if (!codeBlock.hasAttribute('tabindex')) {
            codeBlock.setAttribute('tabindex', '0');
        }
    }

    async function copyCodeToClipboard(codeBlock) {
        try {
            const codeText = extractCodeText(codeBlock);

            if (navigator.clipboard && window.isSecureContext) {
                // Use modern Clipboard API
                await navigator.clipboard.writeText(codeText);
            } else {
                // Fallback for older browsers
                fallbackCopyToClipboard(codeText);
            }

            showCopyFeedback(codeBlock, true);

        } catch (error) {
            console.warn('Failed to copy code:', error);
            showCopyFeedback(codeBlock, false);
        }
    }

    function extractCodeText(codeBlock) {
        const codeElement = codeBlock.querySelector('pre code') ||
                           codeBlock.querySelector('code') ||
                           codeBlock.querySelector('pre');

        if (!codeElement) return '';

        // Handle line-numbered code
        const lines = codeElement.querySelectorAll('.line');
        if (lines.length > 0) {
            return Array.from(lines)
                .map(line => line.textContent)
                .join('\n');
        }

        // Handle regular code blocks
        let text = codeElement.textContent || '';

        // Remove line numbers if they exist as text content
        text = text.replace(/^\s*\d+\s+/gm, '');

        return text.trim();
    }

    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    function showCopyFeedback(codeBlock, success) {
        // Add visual feedback class
        codeBlock.classList.add(success ? 'copied' : 'copy-error');

        // Remove feedback class after animation
        setTimeout(() => {
            codeBlock.classList.remove('copied', 'copy-error');
        }, 2000);

        // Show toast notification if available
        if (window.showToast) {
            window.showToast(
                success ? 'Code copied to clipboard!' : 'Failed to copy code',
                success ? 'success' : 'error'
            );
        }

        // Dispatch custom event for external handlers
        const event = new CustomEvent('codecopied', {
            detail: { success, codeBlock }
        });
        document.dispatchEvent(event);
    }

    // Utility function to get code block language
    function getCodeLanguage(codeBlock) {
        // Try to extract language from class names
        const classList = codeBlock.className;
        const langMatch = classList.match(/language-(\w+)|highlight-(\w+)/);
        return langMatch ? (langMatch[1] || langMatch[2]) : null;
    }

    // Export functions for external use
    window.CodeCopy = {
        init: initCodeCopy,
        copy: copyCodeToClipboard,
        extractText: extractCodeText
    };

})();
