/**
 * Fixed Code Highlighting and Copy Functionality
 * Adds line numbers dynamically and copy functionality
 */

(function() {
    'use strict';

    console.log('💻 Code highlighting initializing...');

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCodeBlocks);
    } else {
        initCodeBlocks();
    }

    function initCodeBlocks() {
        try {
            addLineNumbers();
            addCopyButtons();
            console.log('✅ Code blocks initialized successfully');
        } catch (error) {
            console.error('❌ Code blocks initialization failed:', error);
        }
    }

    function addLineNumbers() {
        const codeBlocks = document.querySelectorAll('.highlight pre code');

        codeBlocks.forEach(codeBlock => {
            const lines = codeBlock.textContent.split('\n');

            // Skip if already processed
            if (codeBlock.querySelector('.line')) return;

            // Clear existing content
            codeBlock.innerHTML = '';

            // Add each line with line number
            lines.forEach((line, index) => {
                // Skip empty last line
                if (index === lines.length - 1 && line.trim() === '') return;

                const lineElement = document.createElement('span');
                lineElement.className = 'line';
                lineElement.textContent = line;

                codeBlock.appendChild(lineElement);

                // Add newline except for last line
                if (index < lines.length - 1) {
                    codeBlock.appendChild(document.createTextNode('\n'));
                }
            });
        });
    }

    function addCopyButtons() {
        const highlights = document.querySelectorAll('.highlight');

        highlights.forEach(highlight => {
            // Skip if copy button already exists
            if (highlight.querySelector('.copy-button')) return;

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.innerHTML = '📋 Copy';
            copyButton.setAttribute('aria-label', 'Copy code to clipboard');

            // Add button styles
            Object.assign(copyButton.style, {
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                opacity: '0',
                transition: 'all 0.3s ease',
                zIndex: '10',
                color: 'var(--text-secondary)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            });

            // Show button on hover
            highlight.addEventListener('mouseenter', () => {
                copyButton.style.opacity = '1';
            });

            highlight.addEventListener('mouseleave', () => {
                copyButton.style.opacity = '0';
            });

            // Copy functionality
            copyButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await copyCodeToClipboard(highlight, copyButton);
            });

            highlight.style.position = 'relative';
            highlight.appendChild(copyButton);
        });
    }

    async function copyCodeToClipboard(codeBlock, button) {
        try {
            // Get the code text (without line numbers)
            const codeElement = codeBlock.querySelector('pre code');
            let codeText = '';

            if (codeElement) {
                // If we have line elements, extract text from them
                const lines = codeElement.querySelectorAll('.line');
                if (lines.length > 0) {
                    codeText = Array.from(lines).map(line => line.textContent).join('\n');
                } else {
                    // Fallback to full text content
                    codeText = codeElement.textContent;
                }
            }

            // Copy to clipboard
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(codeText);
            } else {
                // Fallback for older browsers
                await fallbackCopyTextToClipboard(codeText);
            }

            // Visual feedback
            showCopySuccess(codeBlock, button);

            console.log('✅ Code copied to clipboard');

        } catch (error) {
            console.error('❌ Failed to copy code:', error);
            showCopyError(button);
        }
    }

    function fallbackCopyTextToClipboard(text) {
        return new Promise((resolve, reject) => {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    resolve();
                } else {
                    reject(new Error('execCommand failed'));
                }
            } catch (err) {
                reject(err);
            } finally {
                document.body.removeChild(textArea);
            }
        });
    }

    function showCopySuccess(codeBlock, button) {
        const originalText = button.innerHTML;
        const originalBackground = codeBlock.style.background;
        const originalBorder = codeBlock.style.borderColor;

        // Update button
        button.innerHTML = '✅ Copied!';
        button.style.background = 'var(--success-color)';
        button.style.color = 'white';
        button.style.borderColor = 'var(--success-color)';

        // Highlight code block
        codeBlock.style.background = 'var(--accent-light)';
        codeBlock.style.borderColor = 'var(--accent-color)';

        // Reset after delay
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
            button.style.color = '';
            button.style.borderColor = '';
            codeBlock.style.background = originalBackground;
            codeBlock.style.borderColor = originalBorder;
        }, 2000);
    }

    function showCopyError(button) {
        const originalText = button.innerHTML;

        button.innerHTML = '❌ Failed';
        button.style.background = 'var(--danger-color)';
        button.style.color = 'white';

        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
            button.style.color = '';
        }, 2000);
    }

    // Make functions globally available for manual initialization
    window.addCodeLineNumbers = addLineNumbers;
    window.addCodeCopyButtons = addCopyButtons;
    window.initCodeBlocks = initCodeBlocks;

})();
