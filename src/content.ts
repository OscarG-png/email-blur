function hideEmailAddresses(): void {
	const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

	// Process all text nodes in the document
	const walker = document.createTreeWalker(
		document.body,
		NodeFilter.SHOW_TEXT,
		null
	);

	const nodesToReplace = [];
	let currentNode;

	// First collect all nodes that need replacement
	while ((currentNode = walker.nextNode())) {
		if (currentNode.textContent && emailRegex.test(currentNode.textContent)) {
			nodesToReplace.push(currentNode);
		}
	}

	// Then perform the replacements
	for (const node of nodesToReplace) {
		const parent = node.parentNode;
		if (parent) {
			const newText = node.textContent?.replace(
				emailRegex,
				'[email protected]'
			);
			if (newText) {
				const newNode = document.createTextNode(newText);
				parent.replaceChild(newNode, node);
			}
		}
	}

	// Also check for elements with specific attributes that might contain emails
	const elementsWithAttributes = document.querySelectorAll(
		'[title], [alt], [placeholder], [aria-label]'
	);
	elementsWithAttributes.forEach((element) => {
		['title', 'alt', 'div', 'placeholder', 'aria-label'].forEach((attr) => {
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
	});
}

// Run immediately when the script loads
hideEmailAddresses();

// Set up a MutationObserver to handle dynamically added content
const observer = new MutationObserver((mutations) => {
	let shouldProcess = false;

	// Check if any of the mutations might contain email addresses
	for (const mutation of mutations) {
		if (mutation.type === 'childList' || mutation.type === 'characterData') {
			shouldProcess = true;
			break;
		}
	}

	if (shouldProcess) {
		// Delay the processing slightly to batch multiple rapid DOM changes
		setTimeout(hideEmailAddresses, 10);
	}
});

// Start observing the document with the configured parameters
observer.observe(document.body, {
	childList: true,
	subtree: true,
	characterData: true,
});

// Also run when the page has fully loaded
window.addEventListener('load', hideEmailAddresses);

// Run again after a short delay to catch any dynamic content
setTimeout(hideEmailAddresses, 1000);
