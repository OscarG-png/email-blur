function hideEmailAddresses(): void {
	const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
	const elements = document.querySelectorAll('*');

	elements.forEach((element) => {
		if (element.childNodes.length === 0) {
			return;
		}

		element.childNodes.forEach((node) => {
			if (
				node.nodeType === Node.TEXT_NODE &&
				node.textContent &&
				emailRegex.test(node.textContent)
			) {
				const newElement = document.createElement('span');
				newElement.textContent = node.textContent.replace(
					emailRegex,
					'[email protected]'
				);
				element.replaceChild(newElement, node);
			}
		});
	});
}

// Function to process a single node
function processNode(node: Node): void {
	const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

	if (
		node.nodeType === Node.TEXT_NODE &&
		node.textContent &&
		emailRegex.test(node.textContent)
	) {
		const parent = node.parentElement;
		if (parent) {
			const newElement = document.createElement('span');
			newElement.textContent = node.textContent.replace(
				emailRegex,
				'[email protected]'
			);
			parent.replaceChild(newElement, node);
		}
	} else if (node.nodeType === Node.ELEMENT_NODE) {
		// Process all child nodes
		const element = node as Element;

		// Skip if this is inside an input field or contenteditable element
		if (
			element.tagName === 'INPUT' ||
			element.tagName === 'TEXTAREA' ||
			element.getAttribute('contenteditable') === 'true'
		) {
			return;
		}

		// Process child nodes
		Array.from(element.childNodes).forEach((child) => {
			processNode(child);
		});

		// Check for attributes that might contain emails (like title, alt, etc.)
		['title', 'alt', 'aria-label', 'placeholder'].forEach((attr) => {
			if (element.hasAttribute(attr)) {
				const attrValue = element.getAttribute(attr);
				if (attrValue && emailRegex.test(attrValue)) {
					element.setAttribute(
						attr,
						attrValue.replace(emailRegex, '[email protected]')
					);
				}
			}
		});
	}
}

// Special function to handle Gmail's account switcher
function handleGmailAccountSwitcher(): void {
	// Watch for account switcher modal
	const observer = new MutationObserver((mutations) => {
		// Look for Gmail account switcher elements (they often appear in modals or specific divs)
		const accountElements = document.querySelectorAll(
			'[role="listbox"], [role="menu"]'
		);

		accountElements.forEach((element) => {
			// Process this element specifically - Gmail often uses this for account lists
			processNode(element);

			// Additionally, look for specific account items that might contain emails
			const accountItems = element.querySelectorAll(
				'[role="menuitem"], [role="option"]'
			);
			accountItems.forEach((item) => processNode(item));
		});

		// The specific case shown in the screenshot
		const emailElements = document.querySelectorAll(
			'div[aria-modal="true"] div'
		);
		emailElements.forEach((element) => {
			if (element.childNodes.length > 0) {
				processNode(element);
			}
		});
	});

	// Observe the entire document for the account switcher to appear
	observer.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ['aria-modal', 'role'],
	});
}

// Enhanced function that processes both existing and dynamically added content
function enhancedHideEmailAddresses(): void {
	// Process existing content
	processNode(document.body);

	// Set up observer for dynamic content
	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			// Handle added nodes
			mutation.addedNodes.forEach((node) => {
				processNode(node);
			});

			// Handle attribute changes
			if (
				mutation.type === 'attributes' &&
				mutation.target.nodeType === Node.ELEMENT_NODE
			) {
				const element = mutation.target as Element;
				const attrValue = element.getAttribute(mutation.attributeName || '');

				if (attrValue) {
					const emailRegex =
						/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
					if (emailRegex.test(attrValue)) {
						element.setAttribute(
							mutation.attributeName || '',
							attrValue.replace(emailRegex, '[email protected]')
						);
					}
				}
			}
		});
	});

	// Start observing with configuration options
	observer.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ['title', 'alt', 'aria-label', 'placeholder'],
	});

	// Handle Gmail specifically
	if (
		window.location.hostname.includes('mail.google.com') ||
		window.location.hostname.includes('accounts.google.com')
	) {
		handleGmailAccountSwitcher();
	}
}

// Run the enhanced version
enhancedHideEmailAddresses();

// Run initial scan on DOMContentLoaded to catch early content
document.addEventListener('DOMContentLoaded', () => {
	enhancedHideEmailAddresses();
});

// Also run when the page has fully loaded
window.addEventListener('load', () => {
	enhancedHideEmailAddresses();
});
