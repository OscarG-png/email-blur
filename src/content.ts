function hideEmailAddresses(): void {
	// Hardcoded email to hide
	const emailToHide = '';

	const elements = document.querySelectorAll('*');

	elements.forEach((element) => {
		if (element.childNodes.length === 0) {
			return;
		}

		element.childNodes.forEach((node) => {
			if (node.nodeType === Node.TEXT_NODE && node.textContent) {
				// Check if this node contains the specific email
				if (node.textContent.includes(emailToHide)) {
					console.log('Found email to hide in:', node.textContent);

					const specificEmailRegex = new RegExp(
						`\\b${emailToHide.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
						'g'
					);

					const newText = node.textContent.replace(
						specificEmailRegex,
						'[email protected]'
					);

					node.textContent = newText;
				}
			}
		});
	});
}

// Run immediately
hideEmailAddresses();

// Set up observer for DOM changes
const observer = new MutationObserver(() => {
	hideEmailAddresses();
});

observer.observe(document.body, {
	childList: true,
	subtree: true,
	characterData: true,
});
